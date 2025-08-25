import { GoogleGenerativeAI } from '@google/generative-ai';

export class GoogleAIService {
  private genAI: GoogleGenerativeAI;
  
  constructor(apiKey: string) {
    this.genAI = new GoogleGenerativeAI(apiKey);
  }
  
  async generateScriptFromImage(imageBlob: Blob): Promise<string> {
    try {
      const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      
      // Convert blob to base64
      const arrayBuffer = await imageBlob.arrayBuffer();
      const base64String = this.arrayBufferToBase64(arrayBuffer);
      
      const prompt = `
        You are a professional presentation narrator. Analyze this slide image and create a natural, engaging script for a video narration. 
        
        Guidelines:
        - Write 2-3 sentences that would take about 10-15 seconds to speak
        - Use conversational tone suitable for video narration
        - Focus on the key information visible in the slide
        - Don't mention "this slide" or "as you can see" - speak directly about the content
        - If there's text, summarize and expand on it naturally
        - If there are charts/graphs, explain the key insights
        - Keep it engaging and professional
        
        Return only the script text, no additional formatting or explanations.
      `;
      
      const result = await model.generateContent([
        prompt,
        {
          inlineData: {
            data: base64String,
            mimeType: imageBlob.type
          }
        }
      ]);
      
      const response = await result.response;
      const text = response.text();
      
      return text.trim();
    } catch (error) {
      console.error('Error generating script:', error);
      throw new Error('Failed to generate script. Please check your API key and try again.');
    }
  }
  
  async generateScriptsForSlides(slides: Array<{ id: string; imageBlob: Blob }>): Promise<Array<{ id: string; script: string }>> {
    const results: Array<{ id: string; script: string }> = [];
    
    for (const slide of slides) {
      try {
        const script = await this.generateScriptFromImage(slide.imageBlob);
        results.push({ id: slide.id, script });
        
        // Add a small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`Error generating script for slide ${slide.id}:`, error);
        results.push({ 
          id: slide.id, 
          script: 'Unable to generate script for this slide. Please edit manually.' 
        });
      }
    }
    
    return results;
  }
  
  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }
}