const express = require("express");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const cors = require("cors");
const { NodeSSH } = require("node-ssh");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

let verificationTokens = {};

// Configure nodemailer
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "lectureNoteMaster@gmail.com",
    pass: process.env.gmailPassword,
  },
});

// Endpoint to send verification email
app.post("/send-verification-email", (req, res) => {
  const { email } = req.body;

  if (!email.endsWith("@manhattan.edu")) {
    return res.json({ success: false, message: "Invalid domain" });
  }

  const token = crypto.randomBytes(32).toString("hex");
  const verificationLink = `http://localhost:5000/verify/${token}`;

  verificationTokens[token] = email;
  const mailOptions = {
    from: "lectureNoteMaster@gmail.com",
    to: email,
    subject: "Verify your Manhattan University Email",
    html: `<p>Click the link to verify your email and access the application: <a href="${verificationLink}">${verificationLink}</a></p>`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return res.json({ success: false, message: "Error sending email" });
    }
    res.json({ success: true, message: "Verification email sent" });
  });
});

// Endpoint to verify token
app.get("/verify/:token", (req, res) => {
  const { token } = req.params;
  const email = verificationTokens[token];

  if (email) {
    delete verificationTokens[token];
    res.redirect("http://localhost:3000/application");
  } else {
    res.status(400).send("Invalid or expired token.");
  }
});

// New endpoint to handle SSH and link processing
app.post("/process-link", async (req, res) => {
  const { youtubeLink, noteType } = req.body;

  if (!youtubeLink || !noteType) {
    return res.status(400).json({ success: false, message: "Missing data" });
  }

  const ssh = new NodeSSH();

  try {
    // Connect to the Linux machine
    await ssh.connect({
      host: process.env.artemisIP,  
      username: process.env.artemisUsername, 
      password: process.env.artemisPassword,  
    });
    console.log(noteType)
    // Command to run the Python script to process the video
    const command = `export GOOGLE_API_KEY=${process.env.geminiAPI} && python3 ./process_video.py "${youtubeLink}" "${noteType}"`;
    const result = await ssh.execCommand(command);

    const knownWarning = "grpc_wait_for_shutdown_with_timeout() timed out.";
    if (result.stderr && !result.stderr.includes(knownWarning)) {
      console.error("Error processing video:", result.stderr);
      return res.status(500).json({ success: false, message: "Error processing video" });
    }
    
    // Extract the file name from result.stdout
    let fileName;
    const savePathPhrase = "Notes have been saved to:";
    if (result.stdout.includes(savePathPhrase)) {
      const startIndex = result.stdout.indexOf(savePathPhrase) + savePathPhrase.length;
      fileName = result.stdout.substring(startIndex).trim(); // Get the string after the phrase and trim spaces
    } else {
      console.error("File name not found in output.");
      return res.status(500).json({ success: false, message: "File name not found in output: " + result.stdout });
    }
    
    // Define the remote directory path
    const remoteDirectory = process.env.remoteDirectory;
    
    // Fetch the notes file from the remote server using SCP
    try {
      await ssh.getFile(
        path.join(__dirname, fileName), // Save using the file name
        remoteDirectory + fileName // Combine remote directory with the file name
      );
      console.log("File retrieved successfully.");
    } catch (err) {
      console.error("Error retrieving notes file:", err);
      return res.status(500).json({ success: false, message: "Error retrieving notes" });
    }    
      fs.readFile(
        path.join(__dirname, fileName), 
        'utf8',
        (err, data) => {
          if (err) {
            console.error("Error reading notes file:", err);
            return res.status(500).json({
              success: false,
              message: "Error reading notes file",
            });
          }
      
          console.log("Notes retrieved:", data);
          res.json({
            success: true,
            message: "Link processed successfully",
            output: data, // Sends the raw markdown content
          });
        }
      );      
    // Delete the file after reading
      fs.unlink("C:\\Users\\Computer\\Downloads\\lectureNoteMaster\\backend\\" + fileName, (deleteErr) => {
        if (deleteErr) {
          console.error("Error deleting file:", deleteErr);
        } else {
          console.log("File deleted successfully.");
        }
      });
  } catch (err) {
    console.error("SSH connection error:", err);
    res.status(500).json({ success: false, message: "SSH connection failed" });
  } finally {
    ssh.dispose();
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
