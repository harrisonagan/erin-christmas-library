/**
 * High-performance browser image compressor and precision book cover auto-cropper.
 * Automatically trims surrounding wood/table surfaces and preserves natural book proportions.
 */

export const TARGET_COVER_WIDTH = 780;
export const TARGET_COVER_HEIGHT = 880;

/**
 * Smart multi-point edge detector that automatically slices off wood tables and background borders.
 * Operates entirely on the browser canvas in ~15ms.
 */
export async function autoTrimTableBorders(imageSource) {
  return new Promise((resolve) => {
    const handleImage = (img) => {
      try {
        const sampleW = 240;
        const sampleH = Math.round((img.height / img.width) * sampleW);

        const canvas = document.createElement('canvas');
        canvas.width = sampleW;
        canvas.height = sampleH;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, sampleW, sampleH);

        const imageData = ctx.getImageData(0, 0, sampleW, sampleH);
        const data = imageData.data;

        const getRGB = (x, y) => {
          const cx = Math.min(sampleW - 1, Math.max(0, Math.floor(x)));
          const cy = Math.min(sampleH - 1, Math.max(0, Math.floor(y)));
          const idx = (cy * sampleW + cx) * 4;
          return [data[idx], data[idx + 1], data[idx + 2]];
        };

        // Sample outer perimeter points around the photo
        const bgSamples = [];
        for (const fx of [0.03, 0.18, 0.35, 0.5, 0.65, 0.82, 0.97]) {
          bgSamples.push(getRGB(sampleW * fx, sampleH * 0.02));
          bgSamples.push(getRGB(sampleW * fx, sampleH * 0.98));
        }
        for (const fy of [0.18, 0.35, 0.5, 0.65, 0.82]) {
          bgSamples.push(getRGB(sampleW * 0.02, sampleH * fy));
          bgSamples.push(getRGB(sampleW * 0.98, sampleH * fy));
        }

        const isBg = (x, y) => {
          const [r, g, b] = getRGB(x, y);
          // Warm wood table signature
          if (r > g + 16 && g > b + 8 && r - b >= 28 && r >= 45 && r <= 190 && g <= 135 && b <= 95) {
            for (const [sr, sg, sb] of bgSamples) {
              if (Math.abs(r - sr) + Math.abs(g - sg) + Math.abs(b - sb) < 62) return true;
            }
          }
          for (const [sr, sg, sb] of bgSamples) {
            if (Math.abs(r - sr) + Math.abs(g - sg) + Math.abs(b - sb) < 46) return true;
          }
          return false;
        };

        let top = 0;
        while (top < sampleH * 0.35) {
          let bgCount = 0, total = 0;
          for (let x = Math.floor(sampleW * 0.18); x < sampleW * 0.82; x += 3) {
            total++;
            if (isBg(x, top)) bgCount++;
          }
          if (bgCount / total < 0.38) break;
          top++;
        }

        let bottom = sampleH - 1;
        while (bottom > sampleH * 0.65) {
          let bgCount = 0, total = 0;
          for (let x = Math.floor(sampleW * 0.18); x < sampleW * 0.82; x += 3) {
            total++;
            if (isBg(x, bottom)) bgCount++;
          }
          if (bgCount / total < 0.38) break;
          bottom--;
        }

        let left = 0;
        while (left < sampleW * 0.35) {
          let bgCount = 0, total = 0;
          for (let y = Math.floor(sampleH * 0.18); y < sampleH * 0.82; y += 3) {
            total++;
            if (isBg(left, y)) bgCount++;
          }
          if (bgCount / total < 0.38) break;
          left++;
        }

        let right = sampleW - 1;
        while (right > sampleW * 0.65) {
          let bgCount = 0, total = 0;
          for (let y = Math.floor(sampleH * 0.18); y < sampleH * 0.82; y += 3) {
            total++;
            if (isBg(right, y)) bgCount++;
          }
          if (bgCount / total < 0.38) break;
          right--;
        }

        const ymin = Math.floor((top / sampleH) * 1000);
        const ymax = Math.ceil((bottom / sampleH) * 1000);
        const xmin = Math.floor((left / sampleW) * 1000);
        const xmax = Math.ceil((right / sampleW) * 1000);

        if ((ymax - ymin > 420) && (xmax - xmin > 420) && (ymin > 12 || ymax < 988 || xmin > 12 || xmax < 988)) {
          resolve(cropToBoundingBox(img, [ymin, xmin, ymax, xmax]));
        } else {
          resolve(null);
        }
      } catch (err) {
        resolve(null);
      }
    };

    if (imageSource instanceof HTMLImageElement) {
      if (imageSource.complete) handleImage(imageSource);
      else {
        imageSource.onload = () => handleImage(imageSource);
        imageSource.onerror = () => resolve(null);
      }
    } else if (imageSource instanceof File || imageSource instanceof Blob) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => handleImage(img);
        img.onerror = () => resolve(null);
        img.src = e.target.result;
      };
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(imageSource);
    } else if (typeof imageSource === 'string') {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => handleImage(img);
      img.onerror = () => resolve(null);
      img.src = imageSource;
    } else {
      resolve(null);
    }
  });
}

/**
 * Automatically crops an image to the exact rectangular book cover bounds.
 * box2d is expected as [ymin, xmin, ymax, xmax] on a normalized 0-1000 scale.
 */
export async function cropToBoundingBox(imageSource, box2d) {
  if (!box2d || !Array.isArray(box2d) || box2d.length !== 4) return null;
  const [ymin, xmin, ymax, xmax] = box2d;
  if (ymax <= ymin || xmax <= xmin) return null;

  return new Promise((resolve, reject) => {
    const handleLoadedImage = (img) => {
      // 0.6% inward inset to guarantee no table edge bevel is visible
      const insetX = (xmax - xmin) * 0.006;
      const insetY = (ymax - ymin) * 0.006;

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

      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, sw, sh);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            resolve(null);
            return;
          }
          const croppedFile = new File([blob], 'autocropped_cover.webp', {
            type: 'image/webp',
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
        'image/webp',
        0.9
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
 * Prepares a cropped book cover for saving, preserving its natural book proportions
 * (up to 780x880 WebP) and applying any 90° rotation.
 */
export async function cropUniformCover(imageSource, cropState = {}) {
  const { rotation = 0 } = cropState;

  return new Promise((resolve, reject) => {
    const processImg = (img) => {
      const isSideways = rotation === 90 || rotation === 270;
      const rawW = isSideways ? img.height : img.width;
      const rawH = isSideways ? img.width : img.height;

      const scale = Math.min(1, TARGET_COVER_WIDTH / rawW, TARGET_COVER_HEIGHT / rawH);
      const outW = Math.max(1, Math.round(rawW * scale));
      const outH = Math.max(1, Math.round(rawH * scale));

      const canvas = document.createElement('canvas');
      canvas.width = outW;
      canvas.height = outH;

      const ctx = canvas.getContext('2d');
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      ctx.save();
      ctx.translate(outW / 2, outH / 2);
      if (rotation !== 0) {
        ctx.rotate((rotation * Math.PI) / 180);
      }
      const drawW = isSideways ? outH : outW;
      const drawH = isSideways ? outW : outH;
      ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
      ctx.restore();

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Canvas export failed'));
            return;
          }
          const file = new File([blob], 'book_cover.webp', {
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
      if (imageSource.complete) processImg(imageSource);
      else {
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
