# AI Image Classification Playground

A React web application that uses OpenAI's GPT-4o to classify images as AI-generated or real.

![Image Classification Examples](results/plots/image_grid_visualization.png)

## Prerequisites

- **Node.js** (v18 or higher recommended)
- **npm** (comes with Node.js)
- **OpenAI API key** ([Get one here](https://platform.openai.com/api-keys))

## Setup

### 1. Clone the Repository

```bash
git clone https://github.com/ML72/AI-Image-Classifier-Playground.git
cd AI-Image-Classifier-Playground
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure OpenAI API Key

Set your OpenAI API key as an environment variable:

**Windows (Command Prompt):**
```cmd
set OPENAI_API_KEY=your-api-key-here
```

**Windows (PowerShell):**
```powershell
$env:OPENAI_API_KEY="your-api-key-here"
```

**macOS/Linux:**
```bash
export OPENAI_API_KEY=your-api-key-here
```

> **Note:** For persistent configuration, create a `.env` file in the project root:
> ```
> OPENAI_API_KEY=your-api-key-here
> ```

## Running the Application

### Development Mode

Start the Vite development server with hot-reload:

```bash
npm run dev
```

The app will automatically open in your browser at `http://localhost:3000`. Any changes you make to the code will be instantly reflected.

### Production Build

Create an optimized production build:

```bash
npm run build
```

The built files will be output to the `build/` directory.

### Preview Production Build

Test the production build locally before deployment:

```bash
npm run preview
```

## Command Line Tools

### Classify Individual Images

Classify a single image using the CLI:

**Basic prompt:**
```bash
npm run classify public/images/real/photo.jpg basic
```

**Detailed prompt:**
```bash
npm run classify public/images/ai/generated.png detailed
```

### Batch Evaluation

Run evaluation on multiple images in the `public/images/` directory:

```bash
npm run eval
```

This will generate prediction results in the `results/predictions/` directory.

![Confusion Matrices](results/plots/confusion_matrices.png)

### Visualize Results

Visualize prediction results (requires Python):

```bash
python scripts/visualize_predictions.py
```

Charts will be saved to `results/plots/`.

## Prompts

- **Basic**: Simple question with no guidance
- **Detailed**: Includes specific indicators to look for (distortions, lighting issues, texture anomalies, etc.)

The responses are strictly "Yes" (AI-generated) or "No" (real) for programmatic parsing.

## Project Structure

```
├── public/                 # Static files
├── src/
│   ├── util/              # Utility modules
│   │   ├── classifier.ts  # Main classifier class
│   │   └── prompts.ts     # Prompt definitions
│   ├── App.tsx            # Main React component
│   ├── index.tsx          # React entry point
│   └── index.css          # Global styles
├── scripts/               # Command-line scripts
│   ├── classify.ts        # CLI for single image classification
│   ├── eval.ts            # Batch evaluation script
│   └── visualize_predictions.py  # Visualization tool
└── data/                  # Image data and results
    ├── images/            # Test images (ai/ and real/)
    ├── plots/             # Generated visualizations
    └── predictions/       # Prediction results
```
