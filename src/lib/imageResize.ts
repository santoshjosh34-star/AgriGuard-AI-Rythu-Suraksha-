/**
 * Downscales an uploaded crop image file in the browser so mobile camera photos
 * upload quickly while staying crisp for Gemini Flash / Flash-Lite vision inspection.
 */
export async function compressCropImageFile(file: File, maxDimension = 1280): Promise<string> {
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error('Failed to read selected image file.'));
    reader.readAsDataURL(file);
  });

  if (typeof Image === 'undefined' || typeof document === 'undefined') {
    return dataUrl;
  }

  return await new Promise<string>((resolve) => {
    const img = new Image();
    img.onload = () => {
      const { naturalWidth, naturalHeight } = img;
      if (!naturalWidth || !naturalHeight) {
        resolve(dataUrl);
        return;
      }

      const scale = Math.min(1, maxDimension / Math.max(naturalWidth, naturalHeight));
      const targetWidth = Math.max(1, Math.round(naturalWidth * scale));
      const targetHeight = Math.max(1, Math.round(naturalHeight * scale));

      const canvas = document.createElement('canvas');
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(dataUrl);
        return;
      }

      ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
      const outputMime = file.type === 'image/png' && dataUrl.length < 1_500_000 ? 'image/png' : 'image/jpeg';
      resolve(canvas.toDataURL(outputMime, 0.86));
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}

/**
 * Compresses a farmer's profile avatar into a crisp lightweight JPEG data URL
 * so it persists cleanly in browser localStorage without overflowing quota.
 */
export async function compressAvatarImageFile(file: File, targetSize = 360): Promise<string> {
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error('Failed to read selected profile image.'));
    reader.readAsDataURL(file);
  });

  if (typeof Image === 'undefined' || typeof document === 'undefined') {
    return dataUrl;
  }

  return await new Promise<string>((resolve) => {
    const img = new Image();
    img.onload = () => {
      const { naturalWidth, naturalHeight } = img;
      if (!naturalWidth || !naturalHeight) {
        resolve(dataUrl);
        return;
      }

      const side = Math.min(naturalWidth, naturalHeight);
      const sx = Math.round((naturalWidth - side) / 2);
      const sy = Math.round((naturalHeight - side) / 2);

      const canvas = document.createElement('canvas');
      canvas.width = targetSize;
      canvas.height = targetSize;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(dataUrl);
        return;
      }

      ctx.drawImage(img, sx, sy, side, side, 0, 0, targetSize, targetSize);
      resolve(canvas.toDataURL('image/jpeg', 0.84));
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}

/**
 * Captures a centered square JPEG snapshot from an active webcam <video> stream.
 */
export function captureVideoFrameAsDataUrl(
  video: HTMLVideoElement,
  targetSize = 360
): string | null {
  const vw = video.videoWidth;
  const vh = video.videoHeight;
  if (!vw || !vh) return null;

  const side = Math.min(vw, vh);
  const sx = Math.round((vw - side) / 2);
  const sy = Math.round((vh - side) / 2);

  const canvas = document.createElement('canvas');
  canvas.width = targetSize;
  canvas.height = targetSize;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  ctx.drawImage(video, sx, sy, side, side, 0, 0, targetSize, targetSize);
  return canvas.toDataURL('image/jpeg', 0.85);
}

