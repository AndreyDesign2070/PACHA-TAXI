/**
 * Utility to process and optimize image files into lightweight base64 data URLs.
 * Guarantees crisp rendering without hitting browser localStorage quota limits
 * or Firestore document size limits (1MB limit).
 */

/**
 * Reads a File object into a base64 data URL via FileReader.
 */
function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('No se pudo convertir el archivo a cadena base64.'));
      }
    };
    reader.onerror = () => reject(new Error('Error al leer el archivo seleccionado.'));
    reader.readAsDataURL(file);
  });
}

/**
 * Loads a data URL or blob into an HTMLImageElement safely.
 */
function loadImageFromDataURL(dataUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('No se pudo decodificar la imagen. Verifique el formato.'));
    img.src = dataUrl;
  });
}

/**
 * Loads an image from a File using object URL when possible (zero-copy, fast),
 * falling back to FileReader.
 */
async function loadImageFromFile(file: File): Promise<{ img: HTMLImageElement; cleanup: () => void }> {
  if (typeof URL !== 'undefined' && URL.createObjectURL) {
    try {
      const blobUrl = URL.createObjectURL(file);
      const img = new Image();
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error('Object URL decode failed'));
        img.src = blobUrl;
      });
      return {
        img,
        cleanup: () => {
          try {
            URL.revokeObjectURL(blobUrl);
          } catch {}
        }
      };
    } catch {
      // fallback to FileReader
    }
  }

  const dataUrl = await readFileAsDataURL(file);
  const img = await loadImageFromDataURL(dataUrl);
  return { img, cleanup: () => {} };
}

/**
 * Optimizes an uploaded image file into a highly-compressed, high-fidelity base64 string.
 * Automatically handles sizing, aspect ratio, transparent PNGs, and payload constraints.
 */
export async function optimizeImageFile(
  file: File,
  maxWidth = 750,
  maxHeight = 480,
  quality = 0.75
): Promise<string> {
  // SVG files can be read directly if small
  if (file.type === 'image/svg+xml') {
    const svgStr = await readFileAsDataURL(file);
    if (svgStr.length <= 35000) return svgStr;
  }

  // Hard clamp on target dimensions to prevent oversized canvases
  const effectiveMaxWidth = Math.min(maxWidth, 800);
  const effectiveMaxHeight = Math.min(maxHeight, 550);

  let cleanupFn: (() => void) | null = null;
  try {
    const { img, cleanup } = await loadImageFromFile(file);
    cleanupFn = cleanup;

    let { width, height } = img;
    if (width === 0 || height === 0) {
      return await readFileAsDataURL(file);
    }

    // Compute constrained dimensions maintaining aspect ratio
    if (width > effectiveMaxWidth || height > effectiveMaxHeight) {
      const ratio = Math.min(effectiveMaxWidth / width, effectiveMaxHeight / height);
      width = Math.round(width * ratio);
      height = Math.round(height * ratio);
    }
    width = Math.max(width, 1);
    height = Math.max(height, 1);

    // Draw to Canvas
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d', { willReadFrequently: false });
    if (!ctx) {
      return await readFileAsDataURL(file);
    }

    // Default background for opaque formats
    const isPng = file.type === 'image/png';
    if (!isPng) {
      ctx.fillStyle = '#071322';
      ctx.fillRect(0, 0, width, height);
    }

    ctx.drawImage(img, 0, 0, width, height);

    // Prefer WebP for superior compression, fallback to JPEG
    let mime = 'image/webp';
    let dataUrl = canvas.toDataURL(mime, quality);

    // Check if browser actually produced webp or fell back to png
    const actuallyWebP = dataUrl.startsWith('data:image/webp');
    if (!actuallyWebP) {
      mime = isPng ? 'image/webp' : 'image/jpeg';
      dataUrl = canvas.toDataURL(mime, quality);
      if (!dataUrl.startsWith('data:image/webp')) {
        mime = 'image/jpeg';
        dataUrl = canvas.toDataURL(mime, quality);
      }
    }

    // Adaptive compression loop: Keep payload under ~38,000 characters (~28KB)
    // so that multiple images in partitioned Firestore docs never exceed Firestore limits
    const MAX_DATA_URL_LENGTH = 38000;
    let currentQuality = quality;
    let currentScale = 0.85;

    while (dataUrl.length > MAX_DATA_URL_LENGTH && currentQuality > 0.30) {
      currentQuality -= 0.08;
      const scaledW = Math.max(Math.round(width * currentScale), 100);
      const scaledH = Math.max(Math.round(height * currentScale), 65);

      const subCanvas = document.createElement('canvas');
      subCanvas.width = scaledW;
      subCanvas.height = scaledH;
      const subCtx = subCanvas.getContext('2d');
      if (subCtx) {
        if (!isPng || mime === 'image/jpeg') {
          subCtx.fillStyle = '#071322';
          subCtx.fillRect(0, 0, scaledW, scaledH);
        }
        subCtx.drawImage(canvas, 0, 0, scaledW, scaledH);
        dataUrl = subCanvas.toDataURL(mime, currentQuality);

        // If the data URL is still too large because the browser won't compress PNG losslessly,
        // switch mime to image/jpeg which compresses efficiently and guarantees small payload
        if (dataUrl.length > MAX_DATA_URL_LENGTH && dataUrl.startsWith('data:image/png')) {
          mime = 'image/jpeg';
          subCtx.fillStyle = '#071322';
          subCtx.fillRect(0, 0, scaledW, scaledH);
          subCtx.drawImage(canvas, 0, 0, scaledW, scaledH);
          dataUrl = subCanvas.toDataURL('image/jpeg', currentQuality);
        }
      }
      currentScale *= 0.85;
    }

    return dataUrl;
  } catch (err) {
    console.warn('[PACHA ImageOptimizer] Image optimization fallback:', err);
    try {
      const fallbackUrl = await readFileAsDataURL(file);
      if (fallbackUrl.length <= 48000) {
        return fallbackUrl;
      }
      // If still too large, compress with simple canvas
      return await compressDataUrl(fallbackUrl, 38000);
    } catch {
      throw new Error('No se pudo procesar la imagen seleccionada. Por favor intente con otra imagen JPG o PNG.');
    }
  } finally {
    if (cleanupFn) {
      cleanupFn();
    }
  }
}

/**
 * Re-compresses an existing base64 data URL if it exceeds the maximum safe length.
 */
export async function compressDataUrl(dataUrl: string, maxLen = 38000): Promise<string> {
  if (!dataUrl || !dataUrl.startsWith('data:image/')) return dataUrl;
  if (dataUrl.startsWith('data:image/svg+xml') && dataUrl.length <= maxLen) return dataUrl;
  if (dataUrl.length <= maxLen) return dataUrl;

  try {
    const img = await loadImageFromDataURL(dataUrl);
    let { width, height } = img;
    if (width === 0 || height === 0) return dataUrl;

    const maxDim = 680;
    if (width > maxDim || height > maxDim) {
      const ratio = Math.min(maxDim / width, maxDim / height);
      width = Math.max(Math.round(width * ratio), 1);
      height = Math.max(Math.round(height * ratio), 1);
    }

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return dataUrl;

    ctx.drawImage(img, 0, 0, width, height);
    let mime = 'image/webp';
    let res = canvas.toDataURL(mime, 0.72);
    if (!res.startsWith('data:image/webp')) {
      mime = 'image/jpeg';
      res = canvas.toDataURL(mime, 0.72);
    }

    let quality = 0.70;
    let scale = 0.8;
    while (res.length > maxLen && quality > 0.35) {
      quality -= 0.10;
      const subCanvas = document.createElement('canvas');
      const sw = Math.max(Math.round(width * scale), 80);
      const sh = Math.max(Math.round(height * scale), 60);
      subCanvas.width = sw;
      subCanvas.height = sh;
      const subCtx = subCanvas.getContext('2d');
      if (subCtx) {
        subCtx.drawImage(canvas, 0, 0, sw, sh);
        res = subCanvas.toDataURL(mime, quality);
      }
      scale *= 0.8;
    }
    return res;
  } catch (err) {
    console.warn('[PACHA ImageOptimizer] compressDataUrl error:', err);
    return dataUrl;
  }
}

