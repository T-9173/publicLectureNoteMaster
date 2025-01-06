#!/usr/bin/env python3
import sys
import os
import re
import subprocess
import yt_dlp
import google.generativeai as genai
import requests
from datetime import datetime
import time
from urllib.parse import urlparse, parse_qs

def get_video_id(url):
    # Parses the URL
    parsed_url = urlparse(url)
    
    # Handles youtube.com links
    if parsed_url.hostname == "www.youtube.com" and "v" in parse_qs(parsed_url.query):
        return parse_qs(parsed_url.query)["v"][0]
    
    # Handles youtu.be shortened links
    elif parsed_url.hostname == "youtu.be":
        return parsed_url.path.lstrip("/")
    
    return None  # Return None if the URL doesn't match

def download_youtube_video(url):
    """Downloads a YouTube video at the highest resolution using yt-dlp."""
    print(f"Downloading video from: {url}")

    ydl_opts = {
        "format": "bestvideo+bestaudio/best",  # Choose the best quality video and audio
        "outtmpl": "%(title)s.%(ext)s"  # Save the file with the video title as the name
    }

    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=True)
            file_name = ydl.prepare_filename(info)
            print(f"Downloaded: {file_name}")
            return file_name
    except Exception as e:
        print(f"Error downloading video: {e}")
        sys.exit(1)

def transcribe_video(file_name,url,model_name="distil-whisper/large-v2", device_id=0, batch_size=24):
    """Uses insanely-fast-whisper to transcribe the video."""

    transcript_path = get_video_id(url) + "_transcript.txt"
    if os.path.exists(transcript_path):
        with open(transcript_path, "r") as file:
            return file.read()
    command = [
        "/home/tazad/.local/bin/insanely-fast-whisper",
        "--file-name", file_name,
        "--device-id", str(device_id),
        "--model-name", model_name,
        "--batch-size", str(batch_size),
        "--transcript-path", transcript_path
    ]

    result = subprocess.run(command, capture_output=True, text=True)

    if result.returncode != 0:
        print("Error during transcription:", result.stderr)
        return None

    print(f"Transcript saved to {transcript_path}")

    with open(transcript_path, "r") as file:
        return file.read()

def refine_transcript(transcript, url):
    """Refines the raw transcript using an LLM API, handling large inputs efficiently."""
    transcript_path = f"refined_{get_video_id(url)}_transcript.txt"

    # Checks if the refined transcript already exists
    if os.path.exists(transcript_path):
        with open(transcript_path, "r", encoding="utf-8") as file:
            return file.read()

    transcript = re.sub(r'\b(\w+)( \1\b)+', r'\1', transcript)  # Removes repeated consecutive words

    # Configures the GenAI API
    genai.configure(api_key=os.getenv('GOOGLE_API_KEY'))
    model = genai.GenerativeModel('gemini-pro')

    # Defines the max chunk size
    max_chunk_size = 6000
    refined_transcript = []

    # Chunks the transcript if it's too long
    chunks = [transcript[i:i + max_chunk_size] for i in range(0, len(transcript), max_chunk_size)]
    
    try:
        for index, chunk in enumerate(chunks):
            refine_prompt = f"""
            Paraphrase the following transcript chunk to make it clear, concise, and grammatically accurate. Focus on preserving the original meaning and all details. 
            Avoid using any direct quotes or repeating exact phrases from the original text.
            Chunk {index + 1}/{len(chunks)}:
            {chunk}
            Refined/Paraphrased Chunk:
            """  
            response = model.generate_content(refine_prompt)     
            refined_transcript.append(response.text.strip())
                
        
        final_transcript = "\n".join(refined_transcript)
        
        with open(transcript_path, "w", encoding="utf-8") as file:
            file.write(final_transcript)
        
        return final_transcript
    
    except Exception as e:
        print(f"Error refining transcript: {e}")
        return None

def generate_notes_from_transcript(refined_transcript, note_type,file_name):
    """Generates structured notes from the refined transcript based on the note type."""
    genai.configure(api_key=os.getenv('GOOGLE_API_KEY'))
    model = genai.GenerativeModel('gemini-pro')
    notes_prompt = f"""
    Create {note_type} notes from the transcript in Markdown format. Follow these guidelines:
    Make sure to be as neutral as possible and write the notes in an academic tone. 
    1. Title:
       - Use the format: `## {note_type} Notes for the video titled: {file_name[:-4]}`
    
    2. Formatting:
       - Use Markdown syntax: `#` for main headings, `##` for subheadings, `###` for minor subheadings.
       - Use `**` for bold and `*` for italics.
       - Bullet points with `-` and numbered lists with `1.`.
       - Blockquotes with `>` for quotes or key highlights.
    
    3. Note Specifics:
       - **Comprehensive**: Provide detailed content with examples and analysis. Write as much as possible and use specific ideas from the transcript.
       - **Detailed**: Cover key aspects thoroughly. Write as much as possible and use specific ideas from the transcript.
       - **Brief**: Summarize key points in outline form. Allows user to fill in the gaps themselves.
    
    4. Content Guidelines:
       - Define key terms.
       - Include a summary at the beginning.
       - Write a conclusion and provide further reading/resources.
    
    5. Sections:
       - **Introduction**: Purpose and objectives, main argument.
       - **Main Content**: List key ideas/events with descriptions, examples, and analysis.
       - **Counterarguments**: Present opposing views with analysis, if none are presented in the video, then don't make a section for it.
       - **Summary and Conclusion**: Recap main points and suggest further resources
    
    
    Transcript for notes:
    {refined_transcript}
    
    """
        
    try:
        response = model.generate_content(notes_prompt)
        return response.text
    except Exception as e:
        print(f"Error generating notes: {e}")
        return None

def generate_notes(transcript, note_type,url,file_name):
    """Coordinates refining the transcript and generating notes."""
    # Step 1: Refine the transcript
    refined_transcript = refine_transcript(transcript,url)
    if not refined_transcript:
        print("Failed to refine transcript.")
        return None

    # Step 2: Generate notes from the refined transcript
    notes = generate_notes_from_transcript(refined_transcript, note_type, file_name)
    return notes

def main():
    
    if len(sys.argv) != 3:
        print("Usage: process_video.py <YouTube URL> <Note Type>")
        sys.exit(1)

    youtube_link = sys.argv[1]
    note_type = sys.argv[2]

    # Step 1: Download YouTube video
    video_file = download_youtube_video(youtube_link)

    # Step 2: Transcribe video
    transcript = transcribe_video(video_file,youtube_link)

    if not transcript:
        print("Failed to obtain transcript.")
        sys.exit(1)

    # Step 3: Generate notes
    notes = generate_notes(transcript, note_type,youtube_link,video_file)
    current_datetime = datetime.now()
    noteFile = "note_output" + current_datetime.strftime("%Y-%m-%d_%H-%M-%S-%f") + ".md"

    if notes:
        with open(noteFile, "w") as notes_file:
            notes_file.write(notes)
        print("Notes have been saved to:" + noteFile)
        os.remove(video_file)
    else:
        print("Failed to generate notes.")
        os.remove(video_file)
        sys.exit(1)


if __name__ == "__main__":
    main()

