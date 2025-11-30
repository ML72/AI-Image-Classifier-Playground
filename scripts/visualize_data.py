"""
Visualize AI and Real images in a 10x10 grid.
AI images on the left with red borders, real images on the right with blue borders.
"""

import os
import matplotlib.pyplot as plt
import matplotlib.patches as patches
from PIL import Image
import numpy as np
import random

def load_images_from_folder(folder_path):
    """Load all images from a folder."""
    images = []
    filenames = []
    
    # Get all image files
    valid_extensions = {'.jpg', '.jpeg', '.png', '.bmp', '.gif'}
    files = sorted([f for f in os.listdir(folder_path) 
                   if os.path.splitext(f)[1].lower() in valid_extensions])
    
    for filename in files:
        img_path = os.path.join(folder_path, filename)
        try:
            img = Image.open(img_path)
            # Convert to RGB if needed
            if img.mode != 'RGB':
                img = img.convert('RGB')
            images.append(np.array(img))
            filenames.append(filename)
        except Exception as e:
            print(f"Error loading {filename}: {e}")
    
    return images, filenames

def create_grid_visualization(ai_images, real_images, output_path):
    """Create a 10x10 grid with AI images on left (red border) and real images on right (blue border)."""
    
    # Create figure with 10x10 grid
    fig, axes = plt.subplots(10, 10, figsize=(20, 20))
    fig.suptitle('Dataset of AI Images (Red) and Real Images (Blue)', fontsize=16, y=0.995)
    
    # Process grid column by column (left to right)
    # Left 5 columns for AI images, right 5 columns for real images
    ai_idx = 0
    real_idx = 0
    
    for row in range(10):
        for col in range(10):
            ax = axes[row, col]
            
            # Left half (columns 0-4): AI images with red border
            if col < 5:
                if ai_idx < len(ai_images):
                    ax.imshow(ai_images[ai_idx])
                    # Add red border
                    rect = patches.Rectangle((0, 0), ai_images[ai_idx].shape[1]-1, ai_images[ai_idx].shape[0]-1,
                                            linewidth=3, edgecolor='red', facecolor='none')
                    ax.add_patch(rect)
                    ai_idx += 1
            # Right half (columns 5-9): Real images with blue border
            else:
                if real_idx < len(real_images):
                    ax.imshow(real_images[real_idx])
                    # Add blue border
                    rect = patches.Rectangle((0, 0), real_images[real_idx].shape[1]-1, real_images[real_idx].shape[0]-1,
                                            linewidth=3, edgecolor='blue', facecolor='none')
                    ax.add_patch(rect)
                    real_idx += 1
            
            ax.axis('off')
    
    # Adjust spacing
    plt.subplots_adjust(wspace=0.05, hspace=0.05, left=0.02, right=0.98, top=0.98, bottom=0.02)
    
    # Save the plot
    plt.savefig(output_path, dpi=150, bbox_inches='tight')
    print(f"Visualization saved to: {output_path}")
    plt.close()

def main():
    # Define paths
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    ai_folder = os.path.join(base_dir, 'data', 'images', 'ai')
    real_folder = os.path.join(base_dir, 'data', 'images', 'real')
    output_folder = os.path.join(base_dir, 'data', 'plots')
    output_path = os.path.join(output_folder, 'image_grid_visualization.png')
    
    # Create output folder if it doesn't exist
    os.makedirs(output_folder, exist_ok=True)
    
    # Load images
    print("Loading AI images...")
    ai_images, ai_filenames = load_images_from_folder(ai_folder)
    print(f"Loaded {len(ai_images)} AI images")
    
    print("Loading real images...")
    real_images, real_filenames = load_images_from_folder(real_folder)
    print(f"Loaded {len(real_images)} real images")
    
    # Shuffle images within each group
    print("Shuffling images...")
    combined_ai = list(zip(ai_images, ai_filenames))
    combined_real = list(zip(real_images, real_filenames))
    random.shuffle(combined_ai)
    random.shuffle(combined_real)
    ai_images = [img for img, _ in combined_ai]
    real_images = [img for img, _ in combined_real]
    
    # Create visualization
    print("Creating grid visualization...")
    create_grid_visualization(ai_images, real_images, output_path)

if __name__ == "__main__":
    main()
