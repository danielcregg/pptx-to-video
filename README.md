# PowerPoint to Video Converter

![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-61DAFB?style=flat-square&logo=react&logoColor=black)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)
![FFmpeg](https://img.shields.io/badge/FFmpeg-007808?style=flat-square&logo=ffmpeg&logoColor=white)
![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)

A modern, fully client-side web application that converts PowerPoint presentations into narrated videos entirely in the browser -- no backend server required.

## Overview

Upload a `.pptx` file and the application extracts slide images, generates narration scripts with Google Gemini AI, synthesizes speech using the Web Speech API, and assembles the final MP4 video with ffmpeg.wasm. All processing happens locally in the browser; no files are sent to external servers apart from slide images sent to Google AI for script generation.

## Features

- **100% client-side processing** -- no backend server needed
- **Drag-and-drop file upload** for PowerPoint (.pptx) files
- **AI-powered script generation** via Google Gemini vision models
- **Browser-native text-to-speech** using the Web Speech API
- **In-browser video encoding** with ffmpeg.wasm
- **Guided workflow stepper** (Upload, Scripts, Audio, Video, Download)
- **Script editing interface** for reviewing and customizing narration
- **Browser compatibility detection** for SharedArrayBuffer support
- **GitHub Pages deployment** with automated CI/CD workflow

## Prerequisites

- Node.js 18 or higher
- A Google AI Studio API key ([get one here](https://aistudio.google.com/app/apikey))
- A modern browser with SharedArrayBuffer support (Chrome, Firefox, or Edge)

## Getting Started

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/danielcregg/pptx-to-video.git
   cd pptx-to-video
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open `http://localhost:5173` in your browser.

### Usage

1. **Configure API Key** -- Enter your Google AI Studio API key (stored locally in the browser).
2. **Upload** -- Drag and drop or select a `.pptx` file.
3. **Generate Scripts** -- Let Gemini AI analyze each slide and produce narration scripts.
4. **Edit Scripts** -- Review and customize the generated scripts as needed.
5. **Generate Audio** -- Convert scripts to speech using the browser's text-to-speech engine.
6. **Create Video** -- Combine slide images and audio into a final MP4 video.
7. **Download** -- Save the generated video to your device.

### Deployment

The project includes a GitHub Actions workflow for automatic deployment to GitHub Pages. Push to `main` and the site will be built and deployed automatically.

For manual deployment:
```bash
npm run deploy
```

## Tech Stack

- **React 19** -- UI component framework
- **TypeScript** -- Type-safe JavaScript
- **Vite** -- Fast build tooling and development server
- **Tailwind CSS** -- Utility-first CSS framework
- **Zustand** -- Lightweight state management
- **Google Generative AI (Gemini)** -- AI vision model for slide script generation
- **ffmpeg.wasm** -- Browser-based video encoding
- **JSZip** -- Client-side .pptx file parsing
- **Web Speech API** -- Browser-native text-to-speech synthesis
- **Headless UI** -- Accessible unstyled UI components

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
