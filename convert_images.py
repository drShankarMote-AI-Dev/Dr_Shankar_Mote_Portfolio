import os
import sys
from PIL import Image

def convert_to_webp_and_avif(input_path, quality=85):
    """
    Convert an image to WebP and AVIF formats with the specified quality.
    
    Args:
        input_path (str): Path to the input image file
        quality (int): Quality of the output image (0-100)
    """
    try:
        # Open the image
        img = Image.open(input_path)
        
        # Get the filename without extension
        filename = os.path.splitext(os.path.basename(input_path))[0]
        directory = os.path.dirname(input_path)
        
        # Create output paths
        webp_path = os.path.join(directory, f"{filename}.webp")
        
        # Convert to WebP
        img.save(webp_path, 'WEBP', quality=quality)
        print(f"Converted {input_path} to WebP: {webp_path}")
        
        # For AVIF, we need to check if the pillow-avif-plugin is installed
        try:
            avif_path = os.path.join(directory, f"{filename}.avif")
            img.save(avif_path, 'AVIF', quality=quality)
            print(f"Converted {input_path} to AVIF: {avif_path}")
        except Exception as e:
            print(f"Could not convert to AVIF (you may need pillow-avif-plugin): {e}")
    
    except Exception as e:
        print(f"Error converting {input_path}: {e}")

def main():
    # Convert hero image
    hero_images = [
        "static/images/shankar.jpg",
        "static/images/shankar.jpeg",
        "static/images/Shankar.png"
    ]
    
    # Get current directory
    current_dir = os.path.dirname(os.path.abspath(__file__))
    
    for img_path in hero_images:
        full_path = os.path.join(current_dir, img_path)
        if os.path.exists(full_path):
            print(f"Converting {full_path}...")
            convert_to_webp_and_avif(full_path)
        else:
            print(f"File not found: {full_path}")

if __name__ == "__main__":
    main()
