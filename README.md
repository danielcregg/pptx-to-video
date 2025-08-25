# PowerPoint to Video Converter

A modern, client-side web application that converts PowerPoint presentations (.pptx) into narrated videos entirely in the browser.

## 🌟 Features

- **100% Client-Side**: No backend server required - everything runs in your browser
- **PowerPoint Support**: Upload .pptx files and automatically extract slide images
- **AI-Powered Scripts**: Generate narration scripts using Google AI Studio
- **Text-to-Speech**: Convert scripts to audio narration
- **Video Creation**: Combine slides and audio into MP4 videos using ffmpeg.wasm
- **Modern UI**: Clean, responsive interface built with React + TypeScript + Tailwind CSS
- **GitHub Pages Ready**: Deploy as a static site

## 🚀 Live Demo

Visit the live application: [Your GitHub Pages URL]

## 🛠️ Technology Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS + Headless UI
- **State Management**: Zustand
- **AI Integration**: Google Generative AI (Gemini)
- **Audio Processing**: Web Speech API / Google Cloud Text-to-Speech
- **Video Processing**: ffmpeg.wasm
- **File Processing**: JSZip for .pptx parsing
- **Deployment**: GitHub Pages

## 📋 Prerequisites

- Node.js 18+ and npm
- Google AI Studio API key ([Get one here](https://aistudio.google.com/app/apikey))

## 🏃‍♂️ Quick Start

1. **Clone the repository**
   ```bash
   git clone [your-repo-url]
   cd pptx-to-video
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173`

## 🔧 Setup Instructions

### Google AI API Key
1. Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Create a new API key
3. Enter the API key in the application when prompted
4. The key is stored securely in your browser's local storage

### For Google Cloud Text-to-Speech (Optional)
If you want to use Google Cloud TTS instead of the browser's Web Speech API:
1. Enable the Text-to-Speech API in Google Cloud Console
2. Create a service account and download credentials
3. Update the TTS service in `src/utils/textToSpeech.ts`

## 📱 How to Use

1. **Upload**: Drag and drop or select a .pptx file
2. **Configure**: Enter your Google AI Studio API key
3. **Generate Scripts**: Let AI analyze your slides and create narration scripts
4. **Edit Scripts**: Review and customize the generated scripts
5. **Generate Audio**: Convert scripts to speech audio
6. **Create Video**: Combine slides and audio into a final MP4 video
7. **Download**: Save your video to your device

## 🚀 Deployment

### GitHub Pages (Recommended)

1. **Update Vite config** (already configured in `vite.config.ts`):
   ```typescript
   export default defineConfig({
     base: '/your-repo-name/',
     // ... other config
   });
   ```

2. **Enable GitHub Pages**:
   - Go to your repository settings
   - Navigate to "Pages"
   - Set source to "GitHub Actions"

3. **Deploy**:
   ```bash
   git push origin main
   ```
   The GitHub Action will automatically build and deploy your app.

### Alternative Deployment Options

- **Netlify**: Drag and drop the `dist` folder after running `npm run build`
- **Vercel**: Connect your GitHub repository
- **Any static host**: Upload the contents of `dist` folder

## 🏗️ Project Structure

```
src/
├── components/           # React components
│   ├── ApiKeyConfig.tsx     # API key configuration
│   ├── FileUpload.tsx       # File upload with drag & drop
│   ├── SlideEditor.tsx      # Script editing interface
│   ├── VideoCreator.tsx     # Video creation & download
│   └── WorkflowStepper.tsx  # Progress stepper
├── store/               # State management
│   └── appStore.ts         # Zustand store
├── utils/               # Utility functions
│   ├── pptxProcessor.ts    # PowerPoint file processing
│   ├── googleAI.ts         # Google AI integration
│   ├── textToSpeech.ts     # Audio generation
│   ├── videoProcessor.ts   # Video creation with ffmpeg
│   └── cn.ts              # Tailwind class utilities
├── App.tsx              # Main application component
└── main.tsx            # Application entry point
```

## 🎨 Customization

### Styling
- Modify `tailwind.config.js` for custom themes
- Update component styles in individual `.tsx` files
- Add custom CSS in `src/index.css`

### Video Settings
Customize video parameters in `src/utils/videoProcessor.ts`:
- Resolution (default: 1920x1080)
- Frame rate
- Audio quality
- Slide duration

### AI Prompts
Modify the script generation prompt in `src/utils/googleAI.ts` to customize the narration style.

## 🐛 Troubleshooting

### Common Issues

1. **FFmpeg Loading Errors ("failed to import ffmpeg-core.js")**
   - **Cause**: Missing SharedArrayBuffer support or incorrect CORS headers
   - **Solutions**:
     - Ensure you're serving the app over HTTPS (required for SharedArrayBuffer)
     - Add these headers to your server:
       ```
       Cross-Origin-Embedder-Policy: require-corp
       Cross-Origin-Opener-Policy: same-origin
       Cross-Origin-Resource-Policy: cross-origin
       ```
     - For GitHub Pages: The headers are automatically set correctly
     - For local development: Use `npm run dev` which sets the headers automatically
     - Try a different browser (Chrome, Firefox, Safari recommended)

2. **CORS Errors with ffmpeg.wasm**
   - Ensure proper headers are set in `vite.config.ts`
   - The app needs to be served over HTTPS in production

3. **Large File Processing**
   - ffmpeg.wasm has memory limitations
   - Consider reducing image quality or slide count for very large presentations

4. **API Key Issues**
   - Verify your Google AI API key is valid
   - Check browser console for specific error messages

5. **Audio Generation Problems**
   - Some browsers have limitations with Web Speech API
   - Consider implementing Google Cloud TTS for better reliability

6. **SharedArrayBuffer Not Available**
   - This is required for video processing
   - Ensure your site meets [SharedArrayBuffer requirements](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/SharedArrayBuffer#security_requirements)
   - Use HTTPS and set proper security headers

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [ffmpeg.wasm](https://github.com/ffmpegwasm/ffmpeg.wasm) for browser-based video processing
- [Google AI](https://ai.google.dev/) for script generation
- [React](https://reactjs.org/) and [Vite](https://vitejs.dev/) for the development experience
- [Tailwind CSS](https://tailwindcss.com/) for styling

## 📞 Support

If you encounter any issues or have questions:
- Open an issue on GitHub
- Check the troubleshooting section above
- Review the browser console for error messages

---

**Note**: This application processes all data locally in your browser. No files or data are sent to external servers except for the AI script generation (which only sends slide images to Google AI) and optional Google Cloud TTS API calls.
