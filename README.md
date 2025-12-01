# AI Image Classification Playground

Configure custom prompts to classify AI-generated vs. real photographs! View the interactive web interface on [GitHub Pages](https://ml72.github.io/AI-Image-Classifier-Playground/). You can also run experiments directly on your terminal. View the `scripts` folder for more information.

![Image Classification Examples](results/plots/image_grid_visualization.png)

## Prerequisites

- **Node.js** (v18 or higher recommended)
- **npm** (comes with Node.js)
- **OpenAI API key** ([Get one here](https://platform.openai.com/api-keys))

## Local Environment Setup

### 1. Clone the Repository

```bash
git clone https://github.com/ML72/AI-Image-Classifier-Playground.git
cd AI-Image-Classifier-Playground
```

### 2. Install Dependencies

```bash
npm install
```

## Local Application Development

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

Visit the `scripts` folder for documentation on running experiments from the command line.

Note that you will need Python to run our command line visualization scripts. You will get pretty plots like this though!

![Confusion Matrices](results/plots/confusion_matrices.png)

Charts will be saved to `results/plots/`.

## Prompts

We support two prompts by default, but you can configure custom prompts in our GitHub pages interactive demo:

- **Basic**: Simple question with no guidance
- **Detailed**: Includes specific indicators to look for (distortions, lighting issues, texture anomalies, etc.)

The responses are strictly "Yes" (AI-generated) or "No" (real) for programmatic parsing.

## Project Structure

```
├── public/                     # Static files
│   └── images/                 # Test images (ai/ and real/)
├── src/
│   ├── util/                   # Utility classes
│   ├── App.tsx                 # Main React component
│   ├── index.tsx               # React entry point
│   └── index.css               # Global styles
├── scripts/                    # Scripts to run in terminal
│   ├── generate_predictions.ts
│   ├── visualize_predictions.py
│   └── visualize_data.py
└── results/                    # Image data and results
    ├── plots/                  # Generated visualizations
    └── predictions/            # Prediction results
```
