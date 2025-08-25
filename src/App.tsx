import { useCallback, useEffect } from 'react';
import { useAppStore } from './store/appStore';
import { PPTXProcessor } from './utils/pptxProcessor';
import { GoogleAIService } from './utils/googleAI';
import { TextToSpeechService } from './utils/textToSpeech';
import { VideoProcessor } from './utils/videoProcessor';

import { WorkflowStepper } from './components/WorkflowStepper';
import { ApiKeyConfig } from './components/ApiKeyConfig';
import { FileUpload } from './components/FileUpload';
import { SlideEditor } from './components/SlideEditor';
import { VideoCreator } from './components/VideoCreator';
import { BrowserCompatibilityCheck } from './components/BrowserCompatibilityCheck';

function App() {
  const {
    currentStep,
    slides,
    isProcessingSlides,
    isGeneratingScripts,
    isGeneratingAudio,
    isCreatingVideo,
    videoUrl,
    videoBlob,
    error,
    googleAiApiKey,
    setPptxFile,
    setSlides,
    updateSlideScript,
    setCurrentStep,
    setProcessingSlides,
    setGeneratingScripts,
    setGeneratingAudio,
    setCreatingVideo,
    setError,
    setGoogleAiApiKey,
    setVideoUrl,
    setVideoBlob,
    updateSlideAudio,
  } = useAppStore();

  // Initialize services
  const ttsService = new TextToSpeechService();
  const videoProcessor = new VideoProcessor();

  // Load API key from localStorage
  useEffect(() => {
    const savedApiKey = localStorage.getItem('googleAiApiKey');
    if (savedApiKey) {
      setGoogleAiApiKey(savedApiKey);
    }
  }, [setGoogleAiApiKey]);

  // Handle file upload
  const handleFileUpload = useCallback(async (file: File) => {
    setError(null);
    setProcessingSlides(true);
    setPptxFile(file);

    try {
      const processedSlides = await PPTXProcessor.processSlides(file);
      setSlides(processedSlides);
      setCurrentStep('scripts');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process PowerPoint file');
    } finally {
      setProcessingSlides(false);
    }
  }, [setPptxFile, setSlides, setCurrentStep, setProcessingSlides, setError]);

  // Handle API key setup
  const handleApiKeySet = useCallback((apiKey: string) => {
    setGoogleAiApiKey(apiKey);
    localStorage.setItem('googleAiApiKey', apiKey);
  }, [setGoogleAiApiKey]);

  // Generate scripts using Google AI
  const handleGenerateScripts = useCallback(async () => {
    if (!googleAiApiKey) {
      setError('Please configure your Google AI API key first');
      return;
    }

    setError(null);
    setGeneratingScripts(true);

    try {
      const aiService = new GoogleAIService(googleAiApiKey);
      const slideData = slides.map(slide => ({ id: slide.id, imageBlob: slide.imageBlob }));
      const scriptResults = await aiService.generateScriptsForSlides(slideData);

      scriptResults.forEach(result => {
        updateSlideScript(result.id, result.script);
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate scripts');
    } finally {
      setGeneratingScripts(false);
    }
  }, [googleAiApiKey, slides, updateSlideScript, setGeneratingScripts, setError]);

  // Generate audio for all slides
  const handleGenerateAudio = useCallback(async () => {
    setError(null);
    setGeneratingAudio(true);

    try {
      for (const slide of slides) {
        if (slide.script.trim() && !slide.audioUrl) {
          try {
            const { audioBlob } = await ttsService.generateAudioWithDuration(slide.script);
            const audioUrl = URL.createObjectURL(audioBlob);
            updateSlideAudio(slide.id, audioUrl, audioBlob);
          } catch (err) {
            console.error(`Failed to generate audio for slide ${slide.id}:`, err);
          }
        }
      }
      setCurrentStep('video');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate audio');
    } finally {
      setGeneratingAudio(false);
    }
  }, [slides, updateSlideAudio, setCurrentStep, setGeneratingAudio, setError, ttsService]);

  // Create video
  const handleCreateVideo = useCallback(async () => {
    setError(null);
    setCreatingVideo(true);

    try {
      const videoBlob = await videoProcessor.createVideo(slides, (progress) => {
        // Progress callback could be implemented here
        console.log('Video creation progress:', progress);
      });

      const url = URL.createObjectURL(videoBlob);
      setVideoUrl(url);
      setVideoBlob(videoBlob);
      setCurrentStep('download');
    } catch (err) {
      console.error('Video creation error:', err);
      let errorMessage = 'Failed to create video.';
      
      if (err instanceof Error) {
        if (err.message.includes('SharedArrayBuffer')) {
          errorMessage = 'Video processing requires SharedArrayBuffer support. Please ensure your site is served over HTTPS with proper security headers.';
        } else if (err.message.includes('ffmpeg-core')) {
          errorMessage = 'Failed to load video processing engine. Please check your internet connection and try again.';
        } else {
          errorMessage = err.message;
        }
      }
      
      setError(errorMessage);
    } finally {
      setCreatingVideo(false);
    }
  }, [slides, setVideoUrl, setVideoBlob, setCurrentStep, setCreatingVideo, setError, videoProcessor]);

  // Download video
  const handleDownloadVideo = useCallback(() => {
    if (videoBlob) {
      const url = URL.createObjectURL(videoBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `presentation-video-${new Date().toISOString().split('T')[0]}.mp4`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  }, [videoBlob]);

  // Render current step
  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'upload':
        return (
          <div className="space-y-6">
            <BrowserCompatibilityCheck />
            <ApiKeyConfig 
              onApiKeySet={handleApiKeySet}
              currentApiKey={googleAiApiKey}
            />
            <FileUpload
              onFileSelect={handleFileUpload}
              isProcessing={isProcessingSlides}
              error={error}
            />
          </div>
        );
      
      case 'scripts':
      case 'audio':
        return (
          <SlideEditor
            slides={slides}
            onScriptChange={updateSlideScript}
            onGenerateScripts={handleGenerateScripts}
            onGenerateAudio={handleGenerateAudio}
            isGeneratingScripts={isGeneratingScripts}
            isGeneratingAudio={isGeneratingAudio}
            canGenerateScripts={!!googleAiApiKey}
          />
        );
      
      case 'video':
      case 'download':
        return (
          <VideoCreator
            slides={slides}
            videoUrl={videoUrl}
            onCreateVideo={handleCreateVideo}
            onDownloadVideo={handleDownloadVideo}
            isCreatingVideo={isCreatingVideo}
          />
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                PowerPoint to Video Converter
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Convert your presentations into narrated videos
              </p>
            </div>
            <div className="text-sm text-gray-500">
              Powered by Google AI & ffmpeg.wasm
            </div>
          </div>
        </div>
      </header>

      {/* Workflow Stepper */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <WorkflowStepper currentStep={currentStep} />
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderCurrentStep()}
      </main>

      {/* Error Display */}
      {error && (
        <div className="fixed bottom-4 right-4 max-w-md bg-red-50 border border-red-200 rounded-lg p-4 shadow-lg">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-800">{error}</p>
            </div>
            <div className="ml-auto pl-3">
              <button
                onClick={() => setError(null)}
                className="text-red-400 hover:text-red-600"
              >
                <span className="sr-only">Dismiss</span>
                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-white border-t mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-sm text-gray-500">
            <p>
              Built with React, TypeScript, Tailwind CSS, Google AI, and ffmpeg.wasm
            </p>
            <p className="mt-1">
              All processing happens in your browser - no data is sent to external servers
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
