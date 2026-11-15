/**
 * High-performance browser image compressor and uniform book cover cropper.
 * Standardizes all book covers to a uniform 1:1.4 aspect ratio (600x840px)
 * and compresses them down to web-optimized WebP files (~150-250KB).
 */

export const TARGET_COVER_WIDTH = 600;
export const TARGET_COVER_HEIGHT = 840; // Standard 1:1.4 book cover ratio

/**
 * Automatically crops an image to the exact rectangular book cover bounds detected by AI.
 * box2d is expected as [ymin, xmin, ymax, xmax] on a normalized 0-1000 scale.
 * Slices off 100% of surrounding table surfaces, hands, and background clutter.
 */
export async function cropToBoundingBox(imageSource, box2d) {
  if (!box2d || !Array.isArray(box2d) || box2d.length !== 4) return null;
  const [ymin, xmin, ymax, xmax] = box2d;
  if (ymax <= ymin || xmax <= xmin) return null;

  return new Promise((resolve, reject) => {
    const handleLoadedImage = (img) => {
      // Calculate coordinates in pixel space
      // Add slight 0.5% inward inset to guarantee no background table edge is visible
      const insetX = (xmax - xmin) * 0.005;
      const insetY = (ymax - ymin) * 0.005;

      const normXmin = Math.max(0, xmin + insetX);
      const normYmin = Math.max(0, ymin + insetY);
      const normXmax = Math.min(1000, xmax - insetX);
      const normYmax = Math.min(1000, ymax - insetY);

      const sx = Math.max(0, Math.floor((normXmin / 1000) * img.width));
      const sy = Math.max(0, Math.floor((normYmin / 1000) * img.height));
      const sw = Math.min(img.width - sx, Math.ceil(((normXmax - normXmin) / 1000) * img.width));
      const sh = Math.min(img.height - sy, Math.ceil(((normYmax - normYmin) / 1000) * img.height));

      if (sw <= 20 || sh <= 20) {
        resolve(null);
        return;
      }

      const canvas = document.createElement('canvas');
      canvas.width = sw;
      canvas.height = sh;
      const ctx = canvas.getContext('2d');
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      // Draw strictly the book region
      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, sw, sh);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            resolve(null);
            return;
          }
          const croppedFile = new File([blob], 'autocropped_cover.jpg', {
            type: 'image/jpeg',
            lastModified: Date.now(),
          });
          const croppedUrl = URL.createObjectURL(blob);
          resolve({
            file: croppedFile,
            previewUrl: croppedUrl,
            width: sw,
            height: sh,
          });
        },
        'image/jpeg',
        0.92
      );
    };

    if (imageSource instanceof HTMLImageElement) {
      if (imageSource.complete) handleLoadedImage(imageSource);
      else {
        imageSource.onload = () => handleLoadedImage(imageSource);
        imageSource.onerror = reject;
      }
    } else if (imageSource instanceof File || imageSource instanceof Blob) {
      const reader = new FileReader();
      reader.onerror = reject;
      reader.onload = (e) => {
        const img = new Image();
        img.onerror = reject;
        img.onload = () => handleLoadedImage(img);
        img.src = e.target.result;
      };
      reader.readAsDataURL(imageSource);
    } else if (typeof imageSource === 'string') {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onerror = reject;
      img.onload = () => handleLoadedImage(img);
      img.src = imageSource;
    } else {
      reject(new Error('Unsupported image source for bounding box crop'));
    }
  });
}

/**
 * Crops and standardizes a snapped photo into a uniform book cover.
 * Correctly scales preview touch/mouse pans to the high-res 600x840 canvas.
 */
export async function cropUniformCover(imageSource, cropState = {}) {
  const { 
    zoom = 1, 
    panX = 0, 
    panY = 0,
    previewWidth = 144,
    previewHeight = 208,
  } = cropState;

  return new Promise((resolve, reject) => {
    const processImg = (img) => {
      const canvas = document.createElement('canvas');
      canvas.width = TARGET_COVER_WIDTH;
      canvas.height = TARGET_COVER_HEIGHT;

      const ctx = canvas.getContext('2d');
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      // Base scale to cover target dimensions
      const scaleToFill = Math.max(
        TARGET_COVER_WIDTH / img.width,
        TARGET_COVER_HEIGHT / img.height
      );

      const effectiveScale = scaleToFill * zoom;
      const drawWidth = img.width * effectiveScale;
      const drawHeight = img.height * effectiveScale;

      // Scale pan coordinates from preview resolution to target canvas resolution
      const scaleMultiplier = TARGET_COVER_WIDTH / Math.max(1, previewWidth);
      const canvasPanX = panX * scaleMultiplier;
      const canvasPanY = panY * scaleMultiplier;

      // Center the image + apply scaled user pan offset
      const drawX = (TARGET_COVER_WIDTH - drawWidth) / 2 + canvasPanX;
      const drawY = (TARGET_COVER_HEIGHT - drawHeight) / 2 + canvasPanY;

      // Clean dark background for letterboxing if needed
      ctx.fillStyle = '#18120e';
      ctx.fillRect(0, 0, TARGET_COVER_WIDTH, TARGET_COVER_HEIGHT);

      ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Canvas export failed'));
            return;
          }
          const file = new File([blob], 'uniform_cover.webp', {
            type: 'image/webp',
            lastModified: Date.now(),
          });
          resolve({ file, previewUrl: URL.createObjectURL(blob) });
        },
        'image/webp',
        0.88
      );
    };

    if (imageSource instanceof HTMLImageElement) {
      if (imageSource.complete) {
        processImg(imageSource);
      } else {
        imageSource.onload = () => processImg(imageSource);
        imageSource.onerror = reject;
      }
    } else if (imageSource instanceof File || imageSource instanceof Blob) {
      const reader = new FileReader();
      reader.onerror = reject;
      reader.onload = (e) => {
        const img = new Image();
        img.onerror = reject;
        img.onload = () => processImg(img);
        img.src = e.target.result;
      };
      reader.readAsDataURL(imageSource);
    } else if (typeof imageSource === 'string') {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onerror = reject;
      img.onload = () => processImg(img);
      img.src = imageSource;
    } else {
      reject(new Error('Unsupported image source'));
    }
  });
}

/**
 * General page compressor (for multi-page storybook scans).
 */
export async function compressImage(file, options = {}) {
  const {
    maxWidth = 1600,
    maxHeight = 1600,
    quality = 0.82,
    outputType = 'image/webp',
  } = options;

  if (file.size < 300 * 1024) {
    return file;
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = (event) => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          if (width / height > maxWidth / maxHeight) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        let mime = outputType;
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              resolve(file);
              return;
            }
            const compressedFile = new File(
              [blob],
              file.name.replace(/\.[^/.]+$/, '') + (mime === 'image/webp' ? '.webp' : '.jpg'),
              { type: mime, lastModified: Date.now() }
            );
            resolve(compressedFile);
          },
          mime,
          quality
        );
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  });
}
