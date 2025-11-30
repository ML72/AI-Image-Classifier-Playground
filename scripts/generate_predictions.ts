import { ImageClassifier } from '../src/util/classifier.js';
import fs from 'fs';
import path from 'path';

interface PredictionResult {
  filename: string;
  path: string;
  prediction: 'Yes' | 'No' | 'Unsure';
  rawResponse: string;
}

interface ExperimentResults {
  experimentName: string;
  folderPath: string;
  promptType: 'basic' | 'detailed';
  timestamp: string;
  predictions: PredictionResult[];
  summary: {
    total: number;
    aiGenerated: number;
    real: number;
    unsure: number;
  };
}

/**
 * Normalizes the LLM response to a prediction
 */
function normalizePrediction(response: string): 'Yes' | 'No' | 'Unsure' {
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
 * Delays execution for a specified number of milliseconds
 */
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Gets all image files from a directory
 */
function getImageFiles(folderPath: string): string[] {
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp'];
  const files = fs.readdirSync(folderPath);
  
  return files.filter(file => {
    const ext = path.extname(file).toLowerCase();
    const fullPath = path.join(folderPath, file);
    return imageExtensions.includes(ext) && fs.statSync(fullPath).isFile();
  }).map(file => path.join(folderPath, file));
}

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length < 3) {
    console.log('Usage: npx tsx src/eval.ts <folder-path> <experiment-name> <prompt-type> [delay-ms]');
    console.log('  folder-path: Path to folder containing images to evaluate');
    console.log('  experiment-name: Name for this experiment');
    console.log('  prompt-type: "basic" or "detailed"');
    console.log('  delay-ms: Optional delay between API calls in milliseconds (default: 1000)');
    console.log('\nExample:');
    console.log('  npx tsx src/eval.ts images/real real-images-baseline basic 1000');
    console.log('  npx tsx src/eval.ts images/ai ai-images-detailed detailed 1500');
    process.exit(1);
  }

  const folderPath = args[0];
  const experimentName = args[1];
  const promptType = args[2] as 'basic' | 'detailed';
  const delayMs = parseInt(args[3] || '1000');

  // Validate inputs
  if (!fs.existsSync(folderPath)) {
    console.error(`Error: Folder not found: ${folderPath}`);
    process.exit(1);
  }

  if (!fs.statSync(folderPath).isDirectory()) {
    console.error(`Error: Path is not a directory: ${folderPath}`);
    process.exit(1);
  }

  if (promptType !== 'basic' && promptType !== 'detailed') {
    console.error('Error: prompt-type must be "basic" or "detailed"');
    process.exit(1);
  }

  if (!process.env.OPENAI_API_KEY) {
    console.error('Error: OPENAI_API_KEY environment variable not set');
    console.error('Set it with: set OPENAI_API_KEY=your-api-key-here');
    process.exit(1);
  }

  // Get all image files
  const imageFiles = getImageFiles(folderPath);
  
  if (imageFiles.length === 0) {
    console.error(`Error: No image files found in ${folderPath}`);
    process.exit(1);
  }

  console.log(`\n=== Evaluation Configuration ===`);
  console.log(`Experiment: ${experimentName}`);
  console.log(`Folder: ${folderPath}`);
  console.log(`Prompt type: ${promptType}`);
  console.log(`Images to process: ${imageFiles.length}`);
  console.log(`Delay between calls: ${delayMs}ms`);
  console.log(`================================\n`);

  const classifier = new ImageClassifier();
  const predictions: PredictionResult[] = [];

  // Process each image
  for (let i = 0; i < imageFiles.length; i++) {
    const imagePath = imageFiles[i];
    const filename = path.basename(imagePath);
    
    console.log(`[${i + 1}/${imageFiles.length}] Processing: ${filename}`);
    
    try {
      const rawResponse = await classifier.classifyImage(imagePath, promptType);
      const prediction = normalizePrediction(rawResponse);
      
      predictions.push({
        filename,
        path: imagePath,
        prediction,
        rawResponse,
      });
      
      console.log(`  → ${prediction} (raw: "${rawResponse}")`);
      
      // Add delay between API calls (except after the last one)
      if (i < imageFiles.length - 1) {
        await delay(delayMs);
      }
    } catch (error) {
      console.error(`  ✗ Error: ${error instanceof Error ? error.message : error}`);
      
      // Add the error as an "Unsure" prediction
      predictions.push({
        filename,
        path: imagePath,
        prediction: 'Unsure',
        rawResponse: `ERROR: ${error instanceof Error ? error.message : String(error)}`,
      });
    }
  }

  // Calculate summary statistics
  const summary = {
    total: predictions.length,
    aiGenerated: predictions.filter(p => p.prediction === 'Yes').length,
    real: predictions.filter(p => p.prediction === 'No').length,
    unsure: predictions.filter(p => p.prediction === 'Unsure').length,
  };

  // Create results object
  const results: ExperimentResults = {
    experimentName,
    folderPath,
    promptType,
    timestamp: new Date().toISOString(),
    predictions,
    summary,
  };

  // Ensure output directory exists
  const outputDir = path.join('data', 'predictions');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Write results to file
  const outputPath = path.join(outputDir, `${experimentName}.json`);
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));

  // Print summary
  console.log(`\n=== Evaluation Complete ===`);
  console.log(`Total images: ${summary.total}`);
  console.log(`AI-generated (Yes): ${summary.aiGenerated}`);
  console.log(`Real (No): ${summary.real}`);
  console.log(`Unsure: ${summary.unsure}`);
  console.log(`\nResults saved to: ${outputPath}`);
  console.log(`===========================\n`);
}

main();
