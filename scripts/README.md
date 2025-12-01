# Reproducing Experiments

To reproduce our experiments:

1. Set your OpenAI API key in your terminal, replacing `my-key-here` with your key:

    ```
    set OPENAI_API_KEY="my-key-here"
    ```

2. Generate predictions with both prompts for both classes of images:

    ```
    npx tsx scripts/generate_predictions.ts public/images/real img_real-prompt_basic basic
    npx tsx sscriptsrc/generate_predictions.ts public/images/real img_real-prompt_detailed detailed

    npx tsx scripts/generate_predictions.ts public/images/ai img_ai-prompt_basic basic
    npx tsx scripts/generate_predictions.ts public/images/ai img_ai-prompt_detailed detailed
    ```

3. Make sure you are in a Python environment with `matplotlib` and `numpy` installed. Then generate visualizations:

    ```
    python scripts/visualize_predictions.py
    ```
