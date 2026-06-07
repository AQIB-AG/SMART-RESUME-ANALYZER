import { createWorker } from 'tesseract.js';
import { Jimp } from 'jimp';

const DEFAULT_PSM = 6;
const DEFAULT_TIMEOUT_MS = 28000;
const MAX_IMAGE_WIDTH = 1600;

const preprocessImage = async (imagePath) => {
  const image = await Jimp.read(imagePath);
  if (image.bitmap.width > MAX_IMAGE_WIDTH) {
    image.resize({ w: MAX_IMAGE_WIDTH });
  }
  image.greyscale().contrast(0.15).normalize();
  return image.getBuffer('image/png');
};

const createTesseractWorker = async () => {
  const worker = await createWorker('eng');
  await worker.setParameters({
    tessedit_pageseg_mode: String(DEFAULT_PSM),
    tessedit_ocr_engine_mode: '1',
    preserve_interword_spaces: '1'
  });
  return worker;
};

export const runOcrOnImages = async (imagePaths, options = {}) => {
  const timeoutMs = typeof options.timeoutMs === 'number' ? options.timeoutMs : DEFAULT_TIMEOUT_MS;
  const startTime = Date.now();
  let worker;
  let recognizedText = '';
  let pagesProcessed = 0;

  try {
    worker = await createTesseractWorker();

    for (const imagePath of imagePaths) {
      if (Date.now() - startTime > timeoutMs) {
        break;
      }

      try {
        const imageBuffer = await preprocessImage(imagePath);
        const { data } = await worker.recognize(imageBuffer);
        recognizedText += `${data.text}\n`;
        pagesProcessed += 1;
      } catch (pageError) {
        console.warn(`[OCR_SERVICE] OCR failed for ${imagePath}: ${pageError?.message}`);
      }
    }

    const extractedText = String(recognizedText).trim();
    const duration = Date.now() - startTime;
    const error = extractedText.length === 0 ? 'OCR completed but extracted no text from images' : null;

    return {
      text: extractedText,
      pagesProcessed,
      duration,
      error,
      ocrUsed: true
    };
  } catch (error) {
    const duration = Date.now() - startTime;
    return {
      text: '',
      pagesProcessed,
      duration,
      error: `OCR pipeline failed: ${error?.message || String(error)}`,
      ocrUsed: false
    };
  } finally {
    if (worker) {
      try {
        await worker.terminate();
      } catch (terminateError) {
        console.warn('[OCR_SERVICE] Failed to terminate worker:', terminateError?.message);
      }
    }
  }
};
