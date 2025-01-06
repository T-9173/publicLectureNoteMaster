import React, { useState } from "react";
import { Box, Typography, Container, TextField, Button } from "@mui/material";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Application from './Application'; // Make sure Application component exists

function Home() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email.endsWith("@manhattan.edu")) {
      setMessage("Please use your Manhattan College email address.");
      setIsSuccess(false);
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/send-verification-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      if (data.success) {
        setMessage("Verification email sent. Please check your inbox.");
        setIsSuccess(true);
      } else {
        setMessage("There was an issue sending the email. Please try again.");
        setIsSuccess(false);
      }
    } catch (error) {
      setMessage("Error occurred. Please try again.");
      setIsSuccess(false);
    }
  };

  return (
    <Box
      sx={{
        width: "100vw",
        height: "100vh",
        backgroundImage: "url('https://img.freepik.com/free-photo/cartoon-lofi-young-manga-style-girl-studying-while-listening-music-raining-street-ai-generative_123827-24916.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center center",
        backgroundRepeat: "no-repeat",
        position: "absolute",
        top: 0,
        left: 0,
      }}
    >
      <Container
        maxWidth="sm"
        sx={{
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          padding: "20px",
          borderRadius: "8px",
          border: "2px solid rgba(255, 255, 255, 0.2)",
          boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.5)",
          position: "relative",
        }}
      >
        <Typography
          variant="h4"
          fontFamily={"Poppins"}
          gutterBottom
          align="center"
          sx={{ color: "#fff", fontWeight: "bold" }}
        >
          Welcome to Lecture Note-Master!
        </Typography>
        <Typography
          variant="body1"
          fontFamily={"Poppins"}
          fontSize={"20px"}
          align="center"
          gutterBottom
          sx={{ color: "#ddd", marginBottom: "20px" }}
        >
          Simplify note-taking for online lectures. Submit your YouTube video link,
          and let our app create detailed, AI-generated notes just for you! Let's first confirm that you're a
          Manhattan University student before we get started. Please enter a valid manhattan.edu email address
          below. We will send you a single-use link that will get you started with the application!
        </Typography>

        <form onSubmit={handleSubmit}>
          <TextField
            label="Email Address"
            type="email"
            variant="outlined"
            fullWidth
            required
            margin="normal"
            value={email}
            onChange={handleEmailChange}
            sx={{
              input: {
                color: "#fff",
                fontFamily: "Poppins"
              },
              label: {
                color: "#fff",
                fontFamily: "Poppins"
              },
            }}
          />
          <Button
            variant="contained"
            color="primary"
            fullWidth
            type="submit"
            sx={{
              marginTop: "16px",
              fontFamily: "Poppins",
              backgroundColor: "#1976d2",
              "&:hover": {
                backgroundColor: "#1565c0",
              },
            }}
          >
            Send Verification Link
          </Button>
        </form>
        {message && (
          <Typography
            variant="h5"
            sx={{
              marginTop: "16px",
              textAlign: "center",
              fontWeight: "bold",
              fontFamily: "Poppins",
              textDecorationLine: "underline",
              color: isSuccess ? "#00ff0a" : "#ff1100",
            }}
          >
            {message}
          </Typography>
        )}
      </Container>
    </Box>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/application" element={<Application />} /> {/* This is the main application page */}
      </Routes>
    </Router>
  );
}

export default App;
