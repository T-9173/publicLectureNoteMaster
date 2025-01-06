import React, { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import {
  Box,
  Typography,
  Container,
  TextField,
  Button,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  CircularProgress,
} from "@mui/material";
import { jsPDF } from "jspdf";
import { marked } from "marked";

function Application() {
  const [youtubeLink, setYoutubeLink] = useState("");
  const [noteType, setNoteType] = useState("brief");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [displayedMessage, setDisplayedMessage] = useState("");
  const [seconds, setSeconds] = useState(0);

  const handleLinkChange = (e) => setYoutubeLink(e.target.value);

  const handleRadioChange = (e) => setNoteType(e.target.value);

  const API_KEY = process.env.youtubeAPI;

  const extractVideoID = (url) => {
    const regex = /(?:https?:\/\/(?:www\.)?(?:youtube\.com\/.*[?&]v=|youtu\.be\/))([a-zA-Z0-9_-]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  const checkVideoValidity = async (videoID) => {
    try {
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/videos?id=${videoID}&key=${API_KEY}&part=contentDetails`
      );
      const data = await response.json();
      if (data.items && data.items.length > 0) {
        const video = data.items[0];
        const duration = video.contentDetails.duration;
        const durationMatch = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
        const hours = durationMatch[1] ? parseInt(durationMatch[1], 10) : 0;
        const minutes = durationMatch[2] ? parseInt(durationMatch[2], 10) : 0;
        const totalMinutes = hours * 60 + minutes;
        if (totalMinutes > 90) {
          setMessage("Video duration exceeds 1.5 hours. Please select a shorter video.");
          return false;
        } else {
          return true;
        }
      } else {
        setMessage("Invalid YouTube video link.");
        return false;
      }
    } catch (error) {
      setMessage("Error checking video validity. Please try again.");
      return false;
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!youtubeLink) {
      setMessage("Please enter a YouTube link.");
      return;
    }
    const videoID = extractVideoID(youtubeLink);
    if (!videoID) {
      setMessage("Invalid YouTube link.");
      return;
    }
    const isValid = await checkVideoValidity(videoID);
    if (isValid) {
      setLoading(true);
      setMessage("");
      setDisplayedMessage("");
      try {
        const response = await fetch("http://localhost:5000/process-link", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ youtubeLink, noteType }),
        });
        const result = await response.json();
        setLoading(false);
        if (result.success) {
          animateMessage(result.output); 
        } else {
          setMessage(result.message || "Error generating notes.");
        }
      } catch (error) {
        setLoading(false);
        setMessage("Error communicating with server. Please try again.");
      }
    }
  };

  const animateMessage = (fullMessage) => {
    let index = 0;
    let currentMessage = ""; // Local variable to accumulate the message
    const interval = setInterval(() => {
      if (index < fullMessage.length) {
        currentMessage += fullMessage[index];
        setDisplayedMessage(currentMessage); // Update the state with Markdown content
        index++;
      } else {
        clearInterval(interval);
      }
    }, 5); // Typing speed
  };
  useEffect(() => {
    if (loading) {
      const timer = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);

      return () => clearInterval(timer);
    }
    else {
      setSeconds(0);
    }
  }, [loading]);
  const saveAsPDF = (content) => {
    const doc = new jsPDF();
    doc.setFont("arial", "normal");
  
    const htmlContent = marked(content);  
  
    const margin = 10;
  
    doc.html(htmlContent, {
      margin: [margin, margin, margin, margin], 
      x: margin,
      y: margin,      
      callback: function (doc) {
        doc.save("notes.pdf");
      },
      width: 180, 
      windowWidth: 800, 
      autoPaging: true
    });
  };
  
  const displayMessageAsPDF = () => {
    const markdownContent = displayedMessage;  
    saveAsPDF(markdownContent);
  };  
  return (
    <Box
      sx={{
        width: "100vw",
        minHeight: "100vh",
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
          zIndex: 2,
        }}
      >
        <Typography
          variant="h4"
          gutterBottom
          align="center"
          sx={{ color: "#fff", fontFamily: "Poppins", fontWeight: "bold" }}
        >
          Generate Notes from YouTube Video
        </Typography>
        <Typography
          variant='body1' 
          fontFamily='Poppins'
          fontSize= '20px'
          textAlign= "center"
          gutterBottom
          sx={{ color: "#fff", fontFamily: "Poppins"}}>
          These notes are generated by AI and may contain inaccuracies or omissions. They are intended as a helpful resource but should not be considered a substitute for careful review of the original material. Always verify information and consult primary sources where necessary.
          </Typography>
          
        <form onSubmit={handleSubmit}>
          <TextField
            label="YouTube Video Link"
            type="url"
            variant="outlined"
            fullWidth
            required
            margin="normal"
            value={youtubeLink}
            onChange={handleLinkChange}
            sx={{
              input: { color: "#fff", fontFamily: "Poppins" },
              label: { color: "#fff", fontFamily: "Poppins" },
            }}
          />
          <FormControl component="fieldset" sx={{ marginTop: "16px" }}>
            <FormLabel component="legend" sx={{ color: "#fff", fontWeight: "Bold", fontFamily: "Poppins" }}>
              Select Note Type
            </FormLabel>
            <RadioGroup
              row
              value={noteType}
              onChange={handleRadioChange}
              sx={{ display: "flex", justifyContent: "center" }}
            >
              <FormControlLabel
                value="Brief"
                control={<Radio sx={{ color: "#FFD700" }} />}
                label="Generate Brief Notes"
                sx={{ color: "#fff" }}
              />
              <FormControlLabel
                value="Comprehensive"
                control={<Radio sx={{ color: "#FFD700" }} />}
                label="Generate Comprehensive Notes"
                sx={{ color: "#fff" }}
              />
              <FormControlLabel
                value="Detailed"
                control={<Radio sx={{ color: "#FFD700" }} />}
                label="Generate Detailed Notes"
                sx={{ color: "#fff" }}
              />
            </RadioGroup>
          </FormControl>
          <Button
            variant="contained"
            color="primary"
            fullWidth
            type="submit"
            sx={{
              marginTop: "16px",
              fontSize: "16px",
              fontFamily: "Poppins",
              fontWeight: "bold",
              padding: "10px",
            }}
          >
            Generate Notes
          </Button>
        </form>
        <Box sx={{ marginTop: "32px" }}>
          {loading && (
            <CircularProgress
              size={50}
              sx={{
                color: "#FFD700",
                margin: "0 auto",
                display: "block",
              }}
            />
          )}
          {loading && (
        <Typography sx={{ fontSize: '20px', fontWeight: "heavy" ,textAlign: 'Center' , fontFamily: 'Fantasy', color: '#fff' }}>
          Loading... {seconds} seconds
        </Typography>
        )}
          {message && !loading && (
            <Box
              sx={{
                backgroundColor: "#1e1e1e",
                color: "#fff",
                padding: "20px",
                borderRadius: "8px",
                marginTop: "16px",
                whiteSpace: "pre-wrap",
                maxHeight: "400px",
                overflowY: "auto",
              }}
            >
              {message}
            </Box>
          )}
          {displayedMessage && !loading && (
            <Box
              sx={{
                backgroundColor: "#1e1e1e",
                color: "#fff",
                padding: "20px",
                borderRadius: "8px",
                marginTop: "16px",
                whiteSpace: "pre-wrap", 
                wordWrap: "break-word", 
                overflowY: "auto",
                maxHeight: "400px",
                textAlign: "left",
                fontFamily: "Poppins",
                fontSize: "18px",
                letterSpacing: "0.01px",
                "& h1, & h2, & h3, & h4, & h5, & h6": {
                  marginTop: "2px", 
                  marginBottom: "2px"
                },
                "& p": {
                  marginTop: "1px", 
                  marginBottom: "1px"
                },
                "& ul, & ol": {
                  marginTop: "1px", 
                  marginBottom: "1px"
                },
                "& li": {
                  marginBottom: "1px"
                },
                "& blockquote": {
                  marginTop: "1px", 
                  marginBottom: "1px", 
                  paddingLeft: "16px", 
                  borderLeft: "4px solid #ddd" 
                },
                "a": {
                  color: "#58a6ff"
                }
              }}
            >
              <ReactMarkdown>{displayedMessage}</ReactMarkdown>
              <Button
              variant="contained"
              color="primary"
              onClick={displayMessageAsPDF}
              sx={{
                marginTop: "16px",
                fontSize: "16px",
                fontFamily: "Poppins",
                fontWeight: "bold",
                padding: "10px",
                textAlign: "center"
              }}
            >
              Save as PDF
            </Button>
            </Box>
          )}
        </Box>
      </Container>
    </Box>
  );
}

export default Application;
