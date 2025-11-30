import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';
import { prompts, PromptType } from './prompts';

export class ImageClassifier {
  private openai: OpenAI;

  constructor(apiKey?: string) {
    this.openai = new OpenAI({
      apiKey: apiKey || process.env.OPENAI_API_KEY,
    });
  }

  /**
   * Converts an image file to a base64 data URL
   */
  private imageToBase64(imagePath: string): string {
    const imageBuffer = fs.readFileSync(imagePath);
    const base64Image = imageBuffer.toString('base64');
    const ext = path.extname(imagePath).toLowerCase();
    
    // Determine MIME type
    const mimeTypes: Record<string, string> = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.webp': 'image/webp',
    };
    
    const mimeType = mimeTypes[ext] || 'image/jpeg';
    return `data:${mimeType};base64,${base64Image}`;
  }

  /**
   * Classifies an image as AI-generated or real
   * @param imagePath Path to the image file
   * @param promptType Type of prompt to use ('basic' or 'detailed')
   * @returns Promise resolving to 'Yes' (AI-generated) or 'No' (real)
   */
  async classifyImage(imagePath: string, promptType: PromptType = 'basic'): Promise<string> {
    if (!fs.existsSync(imagePath)) {
      throw new Error(`Image file not found: ${imagePath}`);
    }

    const base64Image = this.imageToBase64(imagePath);
    const prompt = prompts[promptType];

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            {
              type: 'image_url',
              image_url: {
                url: base64Image,
              },
            },
          ],
        },
      ],
      max_tokens: 10,
      temperature: 0,
    });

    const answer = response.choices[0]?.message?.content?.trim() || '';
    return answer;
  }

  /**
   * Classifies an image with both prompts
   * @param imagePath Path to the image file
   * @returns Object with results from both prompts
   */
  async classifyWithBothPrompts(imagePath: string): Promise<{
    basic: string;
    detailed: string;
  }> {
    const [basic, detailed] = await Promise.all([
      this.classifyImage(imagePath, 'basic'),
      this.classifyImage(imagePath, 'detailed'),
    ]);

    return { basic, detailed };
  }
}
