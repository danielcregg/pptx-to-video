import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile } from '@ffmpeg/util';
import type { Slide } from '../store/appStore';

export class VideoProcessor {
  private ffmpeg: FFmpeg;
  private loaded: boolean = false;
  
  constructor() {
    this.ffmpeg = new FFmpeg();
  }
  
  private checkBrowserCompatibility(): void {
    if (typeof SharedArrayBuffer === 'undefined') {
      throw new Error('SharedArrayBuffer is not available. Please ensure your site is served over HTTPS with proper security headers, or use a browser that supports SharedArrayBuffer.');
    }
    
    if (!crossOriginIsolated) {
      console.warn('Cross-origin isolation is not enabled. Video processing may fail.');
    }
  }
  
  async load(): Promise<void> {
    if (this.loaded) return;
    
    // Check browser compatibility first
    this.checkBrowserCompatibility();
    
    try {
      // Use a more reliable approach for loading ffmpeg
      await this.ffmpeg.load({
        coreURL: 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd/ffmpeg-core.js',
        wasmURL: 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd/ffmpeg-core.wasm',
        workerURL: 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd/ffmpeg-core.worker.js',
      });
      
      this.loaded = true;
      console.log('FFmpeg loaded successfully');
    } catch (error) {
      console.error('Error loading FFmpeg:', error);
      // Try alternative CDN
      try {
        await this.ffmpeg.load({
          coreURL: 'https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.6/dist/umd/ffmpeg-core.js',
          wasmURL: 'https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.6/dist/umd/ffmpeg-core.wasm',
          workerURL: 'https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.6/dist/umd/ffmpeg-core.worker.js',
        });
        this.loaded = true;
        console.log('FFmpeg loaded successfully (fallback CDN)');
      } catch (fallbackError) {
        console.error('Error loading FFmpeg from fallback CDN:', fallbackError);
        throw new Error('Failed to load video processing engine. Please refresh and try again. Make sure you are using HTTPS and have a stable internet connection.');
      }
    }
  }
  
  async createVideo(slides: Slide[], onProgress?: (progress: number) => void): Promise<Blob> {
    // Try to load ffmpeg first
    try {
      if (!this.loaded) {
        await this.load();
      }
      return await this.createVideoWithFFmpeg(slides, onProgress);
    } catch (error) {
      console.warn('FFmpeg failed, using fallback method:', error);
      throw new Error('Video creation failed. FFmpeg.wasm could not be loaded. This may be due to browser security restrictions or network issues. Please try refreshing the page or using a different browser.');
    }
  }
  
  private async createVideoWithFFmpeg(slides: Slide[], onProgress?: (progress: number) => void): Promise<Blob> {
    
    try {
      // Clear any existing files
      await this.clearFiles();
      
      const slideDuration = 5; // seconds per slide
      let totalProgress = 0;
      const totalSteps = slides.length * 2 + 2; // slides + audio + concat + final
      
      // Write slide images and audio files
      for (let i = 0; i < slides.length; i++) {
        const slide = slides[i];
        
        // Write image file
        const imageFile = `slide_${i.toString().padStart(3, '0')}.png`;
        await this.ffmpeg.writeFile(imageFile, await fetchFile(slide.imageBlob));
        
        totalProgress++;
        onProgress?.(totalProgress / totalSteps);
        
        // Create audio file (either from slide audio or silence)
        let audioFile = `audio_${i.toString().padStart(3, '0')}.wav`;
        
        if (slide.audioBlob) {
          await this.ffmpeg.writeFile(audioFile, await fetchFile(slide.audioBlob));
        } else {
          // Create silent audio
          await this.ffmpeg.exec([
            '-f', 'lavfi',
            '-i', `anullsrc=channel_layout=stereo:sample_rate=44100`,
            '-t', slideDuration.toString(),
            '-c:a', 'pcm_s16le',
            audioFile
          ]);
        }
        
        totalProgress++;
        onProgress?.(totalProgress / totalSteps);
      }
      
      // Create video segments for each slide
      const segmentFiles: string[] = [];
      
      for (let i = 0; i < slides.length; i++) {
        const imageFile = `slide_${i.toString().padStart(3, '0')}.png`;
        const audioFile = `audio_${i.toString().padStart(3, '0')}.wav`;
        const segmentFile = `segment_${i.toString().padStart(3, '0')}.mp4`;
        
        // Create video segment with image and audio
        await this.ffmpeg.exec([
          '-loop', '1',
          '-i', imageFile,
          '-i', audioFile,
          '-c:v', 'libx264',
          '-t', slideDuration.toString(),
          '-pix_fmt', 'yuv420p',
          '-c:a', 'aac',
          '-strict', 'experimental',
          '-shortest',
          segmentFile
        ]);
        
        segmentFiles.push(segmentFile);
      }
      
      totalProgress++;
      onProgress?.(totalProgress / totalSteps);
      
      // Create concat file for merging segments
      const concatContent = segmentFiles
        .map(file => `file '${file}'`)
        .join('\n');
      
      await this.ffmpeg.writeFile('concat.txt', new TextEncoder().encode(concatContent));
      
      // Concatenate all segments into final video
      await this.ffmpeg.exec([
        '-f', 'concat',
        '-safe', '0',
        '-i', 'concat.txt',
        '-c', 'copy',
        'output.mp4'
      ]);
      
      totalProgress++;
      onProgress?.(totalProgress / totalSteps);
      
      // Read the final video
      const videoData = await this.ffmpeg.readFile('output.mp4');
      // Convert to standard Uint8Array for blob creation
      const arrayBuffer = new ArrayBuffer((videoData as Uint8Array).length);
      const uint8View = new Uint8Array(arrayBuffer);
      uint8View.set(videoData as Uint8Array);
      const videoBlob = new Blob([uint8View], { type: 'video/mp4' });
      
      // Clean up files
      await this.clearFiles();
      
      return videoBlob;
    } catch (error) {
      console.error('Error creating video:', error);
      throw new Error('Failed to create video. Please try again with fewer slides or smaller images.');
    }
  }
  
  private async clearFiles(): Promise<void> {
    try {
      const files = await this.ffmpeg.listDir('/');
      for (const file of files) {
        if (file.name !== '.' && file.name !== '..') {
          try {
            await this.ffmpeg.deleteFile(file.name);
          } catch (e) {
            // Ignore errors when deleting files
          }
        }
      }
    } catch (e) {
      // Ignore errors when listing/clearing files
    }
  }
  
  onProgress(callback: (event: { progress: number; time: number }) => void): void {
    this.ffmpeg.on('progress', (event) => {
      callback({
        progress: event.progress || 0,
        time: event.time || 0
      });
    });
  }
  
  onLog(callback: (log: { type: string; message: string }) => void): void {
    this.ffmpeg.on('log', callback);
  }
}