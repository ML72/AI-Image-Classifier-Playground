import OpenAI from 'openai';

export interface ClassificationResult {
  imageId: string;
  fileName: string;
  prediction: 'Yes' | 'No' | 'Unsure';
  rawResponse: string;
  groundTruth: 'ai' | 'real';
  correct: boolean;
  error?: string;
}

export interface ExperimentResults {
  timestamp: string;
  totalImages: number;
  correct: number;
  incorrect: number;
  unsure: number;
  accuracy: number;
  confusionMatrix: {
    truePositive: number;  // AI correctly identified as AI
    trueNegative: number;  // Real correctly identified as Real
    falsePositive: number; // Real incorrectly identified as AI
    falseNegative: number; // AI incorrectly identified as Real
  };
  results: ClassificationResult[];
}

export class BrowserImageClassifier {
  private openai: OpenAI;

  constructor(apiKey: string) {
    this.openai = new OpenAI({
      apiKey: apiKey,
      dangerouslyAllowBrowser: true, // Required for browser usage
    });
  }

  /**
   * Normalizes the LLM response to a prediction
   */
  private normalizePrediction(response: string): 'Yes' | 'No' | 'Unsure' {
    const trimmed = response.trim().toLowerCase();
    
    if (trimmed.startsWith('yes')) {
      return 'Yes';
    } else if (trimmed.startsWith('no')) {
      return 'No';
    } else {
      return 'Unsure';
    }
  }

  /**
   * Converts an image URL to base64
   */
  private async urlToBase64(url: string): Promise<string> {
    const response = await fetch(url);
    const blob = await response.blob();
    
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  /**
   * Classifies a single image
   */
  async classifyImage(
    imageUrl: string,
    prompt: string
  ): Promise<string> {
    const base64Image = await this.urlToBase64(imageUrl);

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
   * Delays execution for rate limiting
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Runs an experiment on multiple images
   */
  async runExperiment(
    images: Array<{ id: string; url: string; groundTruth: 'ai' | 'real'; fileName: string }>,
    prompt: string,
    delayMs: number = 1000,
    onProgress?: (current: number, total: number) => void
  ): Promise<ExperimentResults> {
    const results: ClassificationResult[] = [];

    // Process each image
    for (let i = 0; i < images.length; i++) {
      const image = images[i];
      
      if (onProgress) {
        onProgress(i + 1, images.length);
      }

      try {
        const rawResponse = await this.classifyImage(image.url, prompt);
        const prediction = this.normalizePrediction(rawResponse);
        
        // Determine if prediction is correct
        // "Yes" means AI-generated, "No" means real
        const correct = 
          (prediction === 'Yes' && image.groundTruth === 'ai') ||
          (prediction === 'No' && image.groundTruth === 'real');

        results.push({
          imageId: image.id,
          fileName: image.fileName,
          prediction,
          rawResponse,
          groundTruth: image.groundTruth,
          correct,
        });

        // Add delay between API calls (except after the last one)
        if (i < images.length - 1) {
          await this.delay(delayMs);
        }
      } catch (error) {
        // Check if this is a critical error (like invalid API key, authentication failure, etc.)
        const errorMessage = error instanceof Error ? error.message : String(error);
        const isCriticalError = 
          errorMessage.includes('Incorrect API key') ||
          errorMessage.includes('invalid_api_key') ||
          errorMessage.includes('authentication') ||
          errorMessage.includes('401') ||
          errorMessage.includes('unauthorized');
        
        if (isCriticalError) {
          // Immediately throw the error to terminate the experiment
          throw error;
        }
        
        // For non-critical errors, log and continue
        results.push({
          imageId: image.id,
          fileName: image.fileName,
          prediction: 'Unsure',
          rawResponse: '',
          groundTruth: image.groundTruth,
          correct: false,
          error: errorMessage,
        });
      }
    }

    // Calculate metrics
    const correctPredictions = results.filter(r => r.correct && r.prediction !== 'Unsure');
    const incorrectPredictions = results.filter(r => !r.correct && r.prediction !== 'Unsure');
    const unsurePredictions = results.filter(r => r.prediction === 'Unsure');

    // Confusion matrix
    const truePositive = results.filter(r => r.prediction === 'Yes' && r.groundTruth === 'ai').length;
    const trueNegative = results.filter(r => r.prediction === 'No' && r.groundTruth === 'real').length;
    const falsePositive = results.filter(r => r.prediction === 'Yes' && r.groundTruth === 'real').length;
    const falseNegative = results.filter(r => r.prediction === 'No' && r.groundTruth === 'ai').length;

    const accuracy = results.length > 0 
      ? correctPredictions.length / (results.length - unsurePredictions.length) 
      : 0;

    return {
      timestamp: new Date().toISOString(),
      totalImages: results.length,
      correct: correctPredictions.length,
      incorrect: incorrectPredictions.length,
      unsure: unsurePredictions.length,
      accuracy,
      confusionMatrix: {
        truePositive,
        trueNegative,
        falsePositive,
        falseNegative,
      },
      results,
    };
  }
}
