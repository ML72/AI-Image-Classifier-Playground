# AI Image Classifier

A React web application that uses OpenAI's GPT-4o to classify images as AI-generated or real.

## Features

- 🎨 Modern React UI with Material-UI (MUI) components
- 📸 Upload and preview images
- 🤖 AI-powered image classification using GPT-4o Vision
- 📊 Choose between basic and detailed analysis prompts
- 📱 Responsive design

## Setup

1. Install dependencies:
```bash
npm install
```

2. Set your OpenAI API key:
```bash
set OPENAI_API_KEY=your-api-key-here
```

## Running the App

### Development Server

Start the Vite development server:
```bash
npm run dev
```

The app will open in your browser at `http://localhost:3000`.

### Build for Production

Create an optimized production build:
```bash
npm run build
```

### Preview Production Build

Preview the production build locally:
```bash
npm run preview
```

### Command Line Tools

Classify an image with the basic prompt:
```bash
npm run classify images/real/photo.jpg basic
```

Classify with the detailed prompt:
```bash
npm run classify images/ai/generated.png detailed
```

Run evaluation on a folder of images:
```bash
npm run eval
```

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

## Technologies

- **React** with TypeScript
- **Material-UI (MUI)** for styling
- **OpenAI GPT-4o Vision** for image classification
- **Node.js** for backend scripts
