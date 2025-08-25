// Note: This uses the Web Speech API which is built into modern browsers
// For production, you might want to use Google Cloud Text-to-Speech API
// but that requires server-side implementation due to CORS restrictions

export class TextToSpeechService {
  private synthesis: SpeechSynthesis;
  
  constructor() {
    this.synthesis = window.speechSynthesis;
  }
  
  async generateAudio(text: string, voice?: string): Promise<{ audioBlob: Blob; duration: number }> {
    return new Promise((resolve, reject) => {
      // Cancel any ongoing speech
      this.synthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      
      // Configure voice settings
      utterance.rate = 0.9; // Slightly slower for clarity
      utterance.pitch = 1.0;
      utterance.volume = 1.0;
      
      // Set voice if specified
      if (voice) {
        const voices = this.synthesis.getVoices();
        const selectedVoice = voices.find(v => v.name === voice || v.lang === voice);
        if (selectedVoice) {
          utterance.voice = selectedVoice;
        }
      }
      
      // Record audio using MediaRecorder
      let startTime: number;
      
      // We'll use a workaround since we can't directly capture SpeechSynthesis
      // Instead, we'll estimate timing and create a silent audio blob with the estimated duration
      utterance.onstart = () => {
        startTime = Date.now();
      };
      
      utterance.onend = () => {
        const duration = (Date.now() - startTime) / 1000;
        
        // Create a silent audio blob with the estimated duration
        const sampleRate = 44100;
        const numSamples = Math.floor(duration * sampleRate);
        
        // Create a blob URL for the silent audio (placeholder)
        // In a real implementation, you'd want to use Google Cloud TTS API
        const arrayBuffer = new ArrayBuffer(numSamples * 2);
        const audioBlob = new Blob([arrayBuffer], { type: 'audio/wav' });
        
        resolve({ audioBlob, duration });
      };
      
      utterance.onerror = (event) => {
        reject(new Error(`Speech synthesis error: ${event.error}`));
      };
      
      this.synthesis.speak(utterance);
    });
  }
  
  // Alternative method using a more realistic approach for production
  async generateAudioWithDuration(text: string, estimatedWPM: number = 150): Promise<{ audioBlob: Blob; duration: number }> {
    // Estimate duration based on word count and words per minute
    const wordCount = text.split(' ').length;
    const estimatedDuration = (wordCount / estimatedWPM) * 60; // Convert to seconds
    
    // Create a minimal WAV file with silence
    const sampleRate = 44100;
    const numSamples = Math.floor(estimatedDuration * sampleRate);
    const buffer = new ArrayBuffer(44 + numSamples * 2); // WAV header + PCM data
    const view = new DataView(buffer);
    
    // WAV header
    const writeString = (offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };
    
    writeString(0, 'RIFF');
    view.setUint32(4, 36 + numSamples * 2, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, 1, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    writeString(36, 'data');
    view.setUint32(40, numSamples * 2, true);
    
    // PCM data (silence)
    for (let i = 0; i < numSamples; i++) {
      view.setInt16(44 + i * 2, 0, true);
    }
    
    const audioBlob = new Blob([buffer], { type: 'audio/wav' });
    
    return { audioBlob, duration: estimatedDuration };
  }
  
  getAvailableVoices(): SpeechSynthesisVoice[] {
    return this.synthesis.getVoices();
  }
  
  async waitForVoices(): Promise<SpeechSynthesisVoice[]> {
    return new Promise((resolve) => {
      let voices = this.synthesis.getVoices();
      if (voices.length > 0) {
        resolve(voices);
        return;
      }
      
      const checkVoices = () => {
        voices = this.synthesis.getVoices();
        if (voices.length > 0) {
          resolve(voices);
        } else {
          setTimeout(checkVoices, 100);
        }
      };
      
      this.synthesis.onvoiceschanged = checkVoices;
      checkVoices();
    });
  }
}

// For production use with Google Cloud Text-to-Speech API:
export class GoogleCloudTTS {
  private apiKey: string;
  
  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }
  
  async synthesizeSpeech(text: string, languageCode: string = 'en-US', voiceName: string = 'en-US-Standard-A'): Promise<Blob> {
    const url = `https://texttospeech.googleapis.com/v1/text:synthesize?key=${this.apiKey}`;
    
    const requestBody = {
      input: { text },
      voice: {
        languageCode,
        name: voiceName,
      },
      audioConfig: {
        audioEncoding: 'MP3',
        speakingRate: 0.9,
        pitch: 0,
      },
    };
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });
      
      if (!response.ok) {
        throw new Error(`TTS API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Convert base64 audio to blob
      const audioBase64 = data.audioContent;
      const audioBytes = atob(audioBase64);
      const audioArray = new Uint8Array(audioBytes.length);
      
      for (let i = 0; i < audioBytes.length; i++) {
        audioArray[i] = audioBytes.charCodeAt(i);
      }
      
      return new Blob([audioArray], { type: 'audio/mp3' });
    } catch (error) {
      console.error('Error synthesizing speech:', error);
      throw new Error('Failed to generate speech. Please check your API key and try again.');
    }
  }
}