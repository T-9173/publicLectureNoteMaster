# Lecture NoteMaster

This is the public repository for the Lecture NoteMaster project. This application allows users to generate notes in various formats from YouTube videos.

## Description

Lecture NoteMaster is a web application designed to simplify the process of taking notes from online lectures and videos. Users can provide a YouTube video link, select their desired note-taking style (Brief, Comprehensive, or Detailed), and the application will generate structured, AI-powered notes in Markdown format. The application also includes a feature to save the generated notes as a PDF. For access control, the application uses an email verification system, currently configured for `@manhattan.edu` email addresses.

## Features

* **Email Verification:** Restricts access to users with a `@manhattan.edu` email address.
* **YouTube Video Processing:**
    * Downloads YouTube videos using `yt-dlp`.
    * Transcribes video audio to text using `insanely-fast-whisper`.
    * Refines the transcript for clarity and accuracy using the Gemini Pro API.
* **AI-Powered Note Generation:**
    * Generates notes from the refined transcript based on the user's selected note type (Brief, Comprehensive, or Detailed).
    * Notes are generated in Markdown format.
* **Note Display and Export:**
    * Displays the generated notes in a clean, readable format.
    * Allows users to save the generated notes as a PDF.

## User Interface Overview

Here are some screenshots showcasing the application's user interface:

### Welcome and Email Verification

The initial welcome page where users enter their email address for verification.
[Welcome to Lecture Note-Master - Initial Page](publicLectureNoteMaster/images/image_welcome_page.png) 

The application provides feedback for invalid email formats, such as a non-Manhattan University email address or missing an '@' symbol.
[Email Verification - Non-Manhattan Email](publicLectureNoteMaster/images/image_non_manhattan_email.png) 
[Email Verification - Missing @ Symbol](publicLectureNoteMaster/images/image_missing_at_symbol.png) 

Upon successful email submission, a verification email is sent to the user's inbox.
[Email Verification - Sent Message](publicLectureNoteMaster/images/image_verification_sent.png) 
[Email Verification - Inbox Email](publicLectureNoteMaster/images/image_inbox_email.png)

### Note Generation Page

The application provides error messages for invalid inputs, such as an invalid URL format or a video exceeding the maximum duration.
[Generate Notes from YouTube Video - Invalid URL Input](publicLectureNoteMaster/images/image_invalid_url.png) 
[Generate Notes from YouTube Video - Video Too Long Error](publicLectureNoteMaster/images/image_video_too_long_error.png) 

While processing, a loading indicator shows the progress.
[Generate Notes from YouTube Video - Loading](publicLectureNoteMaster/images/image_loading_notes.png)

### Generated Notes and Export

Once notes are generated, they are displayed to the user, with an option to save them as a PDF.
[Generated Comprehensive Notes](publicLectureNoteMaster/images/image_generated_notes_done.png) 
[Option to Save Notes as PDF](publicLectureNoteMaster/images/image_pdf_save_option.png)

A sample of the saved PDF notes.
[Sample of Saved PDF Notes](publicLectureNoteMaster/images/image_pdf_notes_sample.png) 

## Tech Stack

### Frontend

* **Framework:** [React.js](https://reactjs.org/)
* **UI Libraries:**
    * [Material-UI](https://mui.com/)
    * [Chakra UI](https://chakra-ui.com/)
* **Routing:** [React Router](https://reactrouter.com/)
* **Markdown Rendering:** [React Markdown](https://github.com/remarkjs/react-markdown)
* **PDF Generation:** [jsPDF](https://github.com/parallax/jsPDF)
* **Testing:**
    * [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
    * [Jest DOM](https://github.com/testing-library/jest-dom)

### Backend

* **Framework:** [Express.js](https://expressjs.com/)
* **Email:** [Nodemailer](https://nodemailer.com/) for sending verification emails.
* **Remote Execution:** [node-ssh](https://github.com/steelbrain/node-ssh) to connect to a remote server and run the Python script.

### Core Logic (Python)

* **Video Downloading:** [yt-dlp](https://github.com/yt-dlp/yt-dlp)
* **Transcription:** [insanely-fast-whisper](https://github.com/Vaibhavs10/insanely-fast-whisper)
* **AI Model:** [Google Gemini Pro](https://ai.google/discover/gemini/)

## How It Works

1.  **Email Verification:** A user enters their `@manhattan.edu` email address. A verification link is sent to the provided email.
2.  **Access Application:** Upon clicking the verification link, the user is redirected to the main application page.
3.  **Submit Request:** The user provides a YouTube video link and selects a note type.
4.  **Backend Processing:** The backend receives the request and establishes an SSH connection to a remote server.
5.  **Execute Python Script:** The `process_video.py` script is executed on the remote server with the YouTube link and note type as arguments.
6.  **Note Generation:** The Python script handles downloading the video, transcribing the audio, refining the transcript, and generating the notes.
7.  **Retrieve Notes:** The backend retrieves the generated notes file from the remote server.
8.  **Display and Download:** The notes are sent to the frontend, displayed to the user, and can be downloaded as a PDF.

## Getting Started

### Prerequisites

### Frontend
* Node.js >= 14.0.0
* npm (any modern version)

### Backend
* Node.js >= 10.16.0
* npm (any modern version)

* Python 3
* Access to a server with the required Python dependencies and `insanely-fast-whisper` installed.
* Google API key for Gemini Pro and YouTube Data API.

### Installation

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/T-9173/publicLectureNoteMaster.git](https://github.com/T-9173/publicLectureNoteMaster.git)
    cd publiclecturenotemaster
    ```
2.  **Install frontend dependencies:**
    ```bash
    npm install
    ```
3.  **Install backend dependencies:**
    ```bash
    cd backend
    npm install
    cd ..
    ```

### Running the Application

1.  **Start the backend server:**
    ```bash
    cd backend
    node server.js
    ```
2.  **Start the frontend development server:**
    ```bash
    npm start
    ```

## Scripts

* `npm start`: Runs the app in development mode.
* `npm test`: Launches the test runner in interactive watch mode.
* `npm run build`: Builds the app for production to the `build` folder.
* `npm run eject`: Ejects the app from Create React App's managed configuration.

## Contributing

Contributions are welcome! Please feel free to submit a pull request.
