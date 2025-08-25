import JSZip from 'jszip';
import type { Slide } from '../store/appStore';

export class PPTXProcessor {
  private static async extractImages(file: File): Promise<{ [key: string]: Blob }> {
    const zip = new JSZip();
    const contents = await zip.loadAsync(file);
    const images: { [key: string]: Blob } = {};
    
    // Extract images from ppt/media/ folder
    const mediaFiles = Object.keys(contents.files).filter(
      fileName => fileName.startsWith('ppt/media/') && 
      (fileName.endsWith('.png') || fileName.endsWith('.jpg') || fileName.endsWith('.jpeg'))
    );
    
    for (const fileName of mediaFiles) {
      const imageData = await contents.files[fileName].async('blob');
      const imageName = fileName.split('/').pop() || fileName;
      images[imageName] = imageData;
    }
    
    return images;
  }
  
  private static async extractSlideRels(file: File): Promise<{ [slideId: string]: string[] }> {
    const zip = new JSZip();
    const contents = await zip.loadAsync(file);
    const slideRels: { [slideId: string]: string[] } = {};
    
    // Get slide relationship files
    const relsFiles = Object.keys(contents.files).filter(
      fileName => fileName.startsWith('ppt/slides/_rels/') && fileName.endsWith('.xml.rels')
    );
    
    for (const relFile of relsFiles) {
      const slideNumber = relFile.match(/slide(\d+)\.xml\.rels/)?.[1];
      if (!slideNumber) continue;
      
      const relContent = await contents.files[relFile].async('text');
      const imageRefs = relContent.match(/Target="\.\.\/media\/[^"]+"/g) || [];
      
      slideRels[slideNumber] = imageRefs.map(ref => 
        ref.replace('Target="../media/', '').replace('"', '')
      );
    }
    
    return slideRels;
  }
  
  private static async renderSlideToCanvas(imageBlob: Blob): Promise<{ canvas: HTMLCanvasElement; blob: Blob }> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }
        
        // Set standard slide dimensions (16:9 aspect ratio)
        canvas.width = 1920;
        canvas.height = 1080;
        
        // Fill with white background
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw the image, scaling to fit while maintaining aspect ratio
        const imgAspect = img.width / img.height;
        const canvasAspect = canvas.width / canvas.height;
        
        let drawWidth, drawHeight, drawX, drawY;
        
        if (imgAspect > canvasAspect) {
          // Image is wider than canvas aspect ratio
          drawWidth = canvas.width;
          drawHeight = canvas.width / imgAspect;
          drawX = 0;
          drawY = (canvas.height - drawHeight) / 2;
        } else {
          // Image is taller than canvas aspect ratio
          drawHeight = canvas.height;
          drawWidth = canvas.height * imgAspect;
          drawX = (canvas.width - drawWidth) / 2;
          drawY = 0;
        }
        
        ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
        
        canvas.toBlob((blob) => {
          if (blob) {
            resolve({ canvas, blob });
          } else {
            reject(new Error('Failed to create blob from canvas'));
          }
        }, 'image/png');
      };
      
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(imageBlob);
    });
  }
  
  static async processSlides(file: File): Promise<Slide[]> {
    try {
      const images = await this.extractImages(file);
      const slideRels = await this.extractSlideRels(file);
      const slides: Slide[] = [];
      
      // If we have slide relationships, use them to match images to slides
      if (Object.keys(slideRels).length > 0) {
        for (const [slideNumber, imageRefs] of Object.entries(slideRels)) {
          const slideId = `slide-${slideNumber}`;
          
          // Use the first image reference for this slide
          if (imageRefs.length > 0) {
            const imageBlob = images[imageRefs[0]];
            if (imageBlob) {
              const { blob } = await this.renderSlideToCanvas(imageBlob);
              const imageUrl = URL.createObjectURL(blob);
              
              slides.push({
                id: slideId,
                imageUrl,
                imageBlob: blob,
                script: `Script for slide ${slideNumber}`,
              });
            }
          }
        }
      } else {
        // Fallback: create slides from all available images
        let slideIndex = 1;
        for (const [, imageBlob] of Object.entries(images)) {
          const { blob } = await this.renderSlideToCanvas(imageBlob);
          const imageUrl = URL.createObjectURL(blob);
          
          slides.push({
            id: `slide-${slideIndex}`,
            imageUrl,
            imageBlob: blob,
            script: `Script for slide ${slideIndex}`,
          });
          slideIndex++;
        }
      }
      
      // If no images found, create a placeholder slide
      if (slides.length === 0) {
        const canvas = document.createElement('canvas');
        canvas.width = 1920;
        canvas.height = 1080;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = '#f3f4f6';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.fillStyle = '#374151';
          ctx.font = '48px Arial';
          ctx.textAlign = 'center';
          ctx.fillText('No slide content found', canvas.width / 2, canvas.height / 2);
          
          const blob = await new Promise<Blob>((resolve) => {
            canvas.toBlob((blob) => resolve(blob!), 'image/png');
          });
          
          slides.push({
            id: 'slide-1',
            imageUrl: URL.createObjectURL(blob),
            imageBlob: blob,
            script: 'No content available for this slide.',
          });
        }
      }
      
      return slides;
    } catch (error) {
      console.error('Error processing PPTX file:', error);
      throw new Error('Failed to process PowerPoint file. Please ensure it\'s a valid .pptx file.');
    }
  }
}