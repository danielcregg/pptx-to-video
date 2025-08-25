import { create } from 'zustand';

export interface Slide {
  id: string;
  imageUrl: string;
  imageBlob: Blob;
  script: string;
  audioUrl?: string;
  audioBlob?: Blob;
}

export interface AppState {
  // Current step in the workflow
  currentStep: 'upload' | 'scripts' | 'audio' | 'video' | 'download';
  
  // File processing
  pptxFile: File | null;
  slides: Slide[];
  
  // Processing states
  isProcessingSlides: boolean;
  isGeneratingScripts: boolean;
  isGeneratingAudio: boolean;
  isCreatingVideo: boolean;
  
  // Final video
  videoUrl: string | null;
  videoBlob: Blob | null;
  
  // Error handling
  error: string | null;
  
  // API configuration
  googleAiApiKey: string | null;
  
  // Actions
  setPptxFile: (file: File) => void;
  setSlides: (slides: Slide[]) => void;
  updateSlideScript: (slideId: string, script: string) => void;
  setCurrentStep: (step: AppState['currentStep']) => void;
  setProcessingSlides: (isProcessing: boolean) => void;
  setGeneratingScripts: (isGenerating: boolean) => void;
  setGeneratingAudio: (isGenerating: boolean) => void;
  setCreatingVideo: (isCreating: boolean) => void;
  setError: (error: string | null) => void;
  setGoogleAiApiKey: (key: string) => void;
  setVideoUrl: (url: string | null) => void;
  setVideoBlob: (blob: Blob | null) => void;
  updateSlideAudio: (slideId: string, audioUrl: string, audioBlob: Blob) => void;
  reset: () => void;
}

const initialState = {
  currentStep: 'upload' as const,
  pptxFile: null,
  slides: [],
  isProcessingSlides: false,
  isGeneratingScripts: false,
  isGeneratingAudio: false,
  isCreatingVideo: false,
  videoUrl: null,
  videoBlob: null,
  error: null,
  googleAiApiKey: null,
};

export const useAppStore = create<AppState>((set) => ({
  ...initialState,
  
  setPptxFile: (file) => set({ pptxFile: file }),
  
  setSlides: (slides) => set({ slides }),
  
  updateSlideScript: (slideId, script) => set((state) => ({
    slides: state.slides.map(slide => 
      slide.id === slideId ? { ...slide, script } : slide
    )
  })),
  
  setCurrentStep: (step) => set({ currentStep: step }),
  
  setProcessingSlides: (isProcessing) => set({ isProcessingSlides: isProcessing }),
  
  setGeneratingScripts: (isGenerating) => set({ isGeneratingScripts: isGenerating }),
  
  setGeneratingAudio: (isGenerating) => set({ isGeneratingAudio: isGenerating }),
  
  setCreatingVideo: (isCreating) => set({ isCreatingVideo: isCreating }),
  
  setError: (error) => set({ error }),
  
  setGoogleAiApiKey: (key) => set({ googleAiApiKey: key }),
  
  setVideoUrl: (url) => set({ videoUrl: url }),
  
  setVideoBlob: (blob) => set({ videoBlob: blob }),
  
  updateSlideAudio: (slideId, audioUrl, audioBlob) => set((state) => ({
    slides: state.slides.map(slide => 
      slide.id === slideId ? { ...slide, audioUrl, audioBlob } : slide
    )
  })),
  
  reset: () => set(initialState),
}));