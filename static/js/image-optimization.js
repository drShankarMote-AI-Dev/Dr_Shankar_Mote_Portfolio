// Image optimization script
document.addEventListener('DOMContentLoaded', function() {
  // Function to check if browser supports WebP
  function checkWebPSupport() {
    return new Promise(resolve => {
      const webP = new Image();
      webP.onload = webP.onerror = function() {
        resolve(webP.height === 2);
      };
      webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
    });
  }

  // Function to check if browser supports AVIF
  function checkAVIFSupport() {
    return new Promise(resolve => {
      const avif = new Image();
      avif.onload = avif.onerror = function() {
        resolve(avif.height === 2);
      };
      avif.src = 'data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAAB0AAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAIAAAACAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQ0MAAAAABNjb2xybmNseAACAAIAAYAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAACVtZGF0EgAKCBgANogQEAwgMg8f8D///8WfhwB8+ErK42A=';
    });
  }

  // Function to modify image sources based on browser support
  async function updateImageSources() {
    const supportsWebP = await checkWebPSupport();
    const supportsAVIF = await checkAVIFSupport();
    
    // Get all images
    const images = document.querySelectorAll('img');
    
    images.forEach(img => {
      const src = img.getAttribute('src');
      
      // Skip if it's already a WebP or AVIF image or data URI
      if (src.includes('.webp') || src.includes('.avif') || src.startsWith('data:')) {
        return;
      }
      
      // Add dataset attribute to original source for fallback
      img.dataset.original = src;
      
      // Determine which format to use based on browser support
      if (supportsAVIF) {
        // Replace the extension with .avif
        const avifSrc = src.replace(/\.(jpe?g|png)$/i, '.avif');
        img.setAttribute('src', avifSrc);
      } else if (supportsWebP) {
        // Replace the extension with .webp
        const webpSrc = src.replace(/\.(jpe?g|png)$/i, '.webp');
        img.setAttribute('src', webpSrc);
      }
      
      // Add error handling in case the optimized image fails to load
      img.onerror = function() {
        // Revert to original source if optimized image fails to load
        if (img.dataset.original) {
          img.setAttribute('src', img.dataset.original);
        }
      };
    });
  }
  
  // Add lazy loading to all images except the hero image
  function addLazyLoading() {
    const images = document.querySelectorAll('img:not(.profile-image)');
    images.forEach(img => {
      if (!img.hasAttribute('loading')) {
        img.setAttribute('loading', 'lazy');
      }
    });
  }
  
  // Run optimization functions
  updateImageSources();
  addLazyLoading();
});
