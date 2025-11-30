"""
Visualize predictions from AI image classifier experiments.

There must be existing prediction JSON files in the data/predictions/ directory.
"""

import json
from pathlib import Path
import numpy as np
import matplotlib.pyplot as plt
from matplotlib.patches import Rectangle


def load_predictions(predictions_dir):
    """Load all prediction files from the predictions directory."""
    predictions_dir = Path(predictions_dir)
    predictions = {}
    
    for file in predictions_dir.glob("*.json"):
        with open(file, 'r') as f:
            data = json.load(f)
            predictions[file.stem] = data
    
    return predictions


def calculate_confusion_matrix(predictions, ground_truth):
    """
    Calculate confusion matrix.
    
    Args:
        predictions: List of prediction dicts with 'prediction' field
        ground_truth: Ground truth label ("Yes" or "No")
    
    Returns:
        Confusion matrix as [[TP, FP], [FN, TN]] for ground_truth="Yes"
        or [[TN, FN], [FP, TP]] for ground_truth="No"
    """
    tp = fp = tn = fn = 0
    
    for pred in predictions:
        prediction = pred['prediction']
        
        if ground_truth == "Yes":  # AI-generated images
            if prediction == "Yes":
                tp += 1
            else:
                fn += 1
        else:  # Real images
            if prediction == "No":
                tn += 1
            else:
                fp += 1
    
    # Return in standard confusion matrix format
    # [[TN, FP], [FN, TP]]
    return np.array([[tn, fp], [fn, tp]])


def plot_confusion_matrices(predictions_data):
    """Create side-by-side confusion matrices for basic and detailed prompts."""
    fig, axes = plt.subplots(1, 2, figsize=(12, 5))
    
    prompt_types = ['basic', 'detailed']
    
    for idx, prompt_type in enumerate(prompt_types):
        ax = axes[idx]
        
        # Gather predictions for this prompt type
        ai_preds = predictions_data[f'img_ai-prompt_{prompt_type}']['predictions']
        real_preds = predictions_data[f'img_real-prompt_{prompt_type}']['predictions']
        
        # Calculate confusion matrix components
        cm_ai = calculate_confusion_matrix(ai_preds, "Yes")
        cm_real = calculate_confusion_matrix(real_preds, "No")
        
        # Combine into full confusion matrix
        # cm[i][j] where i=actual, j=predicted
        cm = cm_ai + cm_real
        
        # Calculate accuracy
        accuracy = (cm[0, 0] + cm[1, 1]) / cm.sum()
        
        # Plot confusion matrix
        im = ax.imshow(cm, cmap='Blues', aspect='auto')
        
        # Add text annotations
        for i in range(2):
            for j in range(2):
                text = ax.text(j, i, str(cm[i, j]), ha="center", va="center", color="black", fontsize=20)
        
        # Set labels
        ax.set_xticks([0, 1])
        ax.set_yticks([0, 1])
        ax.set_xticklabels(['No', 'Yes'])
        ax.set_yticklabels(['No', 'Yes'])
        ax.set_xlabel('Predicted', fontsize=12)
        ax.set_ylabel('Actual', fontsize=12)
        ax.set_title(f'{prompt_type.capitalize()} Prompt\nAccuracy: {accuracy:.2%}', fontsize=14)
        
        # Add colorbar
        plt.colorbar(im, ax=ax)
    
    plt.tight_layout()
    return fig


def plot_recall_over_time(predictions_data):
    """Plot recall over time for AI-generated images."""
    fig, ax = plt.subplots(figsize=(10, 6))
    
    # Define the chronological order of AI generation methods
    methods = ['gan', 'diffusion1', 'diffusion2', 'diffusion3', 'diffusion4']
    prompt_types = ['basic', 'detailed']
    
    for prompt_type in prompt_types:
        ai_preds = predictions_data[f'img_ai-prompt_{prompt_type}']['predictions']
        
        # Calculate recall for each method
        recalls = []
        
        for method in methods:
            # Filter predictions for this method
            method_preds = [p for p in ai_preds if p['filename'].startswith(method)]
            
            # Calculate recall (correct prediction is "Yes" for AI images)
            correct = sum(1 for p in method_preds if p['prediction'] == 'Yes')
            total = len(method_preds)
            recall = correct / total if total > 0 else 0
            recalls.append(recall)
        
        # Plot line
        ax.plot(recalls, marker='o', linewidth=2, markersize=8, label=f'{prompt_type.capitalize()} Prompt')
    
    ax.set_xlabel('AI Generation Method (Chronological)', fontsize=12)
    ax.set_ylabel('Recall', fontsize=12)
    ax.set_title('Recall Over Time for AI-Generated Images', fontsize=14)
    ax.set_ylim([0, 1.05])
    ax.set_xticks([])
    ax.grid(True, alpha=0.3)
    ax.legend(fontsize=11)
    
    # Add percentage labels on y-axis
    ax.yaxis.set_major_formatter(plt.FuncFormatter(lambda y, _: f'{y:.0%}'))
    
    plt.tight_layout()
    return fig


def main():
    """Main function to generate all visualizations."""
    # Get the project root directory
    script_dir = Path(__file__).parent
    project_root = script_dir.parent
    predictions_dir = project_root / 'data' / 'predictions'
    plots_dir = project_root / 'data' / 'plots'
    
    # Create plots directory if it doesn't exist
    plots_dir.mkdir(parents=True, exist_ok=True)
    
    # Load all predictions
    print("Loading predictions...")
    predictions_data = load_predictions(predictions_dir)
    print(f"Loaded {len(predictions_data)} prediction files")
    
    # Generate confusion matrix plot
    print("Generating confusion matrices...")
    fig1 = plot_confusion_matrices(predictions_data)
    output_path1 = plots_dir / 'confusion_matrices.png'
    fig1.savefig(output_path1, dpi=300, bbox_inches='tight')
    plt.close(fig1)
    print(f"Saved confusion matrices to {output_path1}")
    
    # Generate recall over time plot
    print("Generating recall over time plot...")
    fig2 = plot_recall_over_time(predictions_data)
    output_path2 = plots_dir / 'recall_over_time.png'
    fig2.savefig(output_path2, dpi=300, bbox_inches='tight')
    plt.close(fig2)
    print(f"Saved recall over time plot to {output_path2}")

if __name__ == '__main__':
    main()
