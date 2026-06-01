import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';
import { createWorker } from 'tesseract.js';
import { createCanvas } from '@napi-rs/canvas';

const MAX_OCR_PAGES = 6;
const MAX_OCR_DURATION_MS = 30000;
const DEFAULT_DPI_SCALE = 2.0;

const createPngBufferFromPage = async (page) => {
  const viewport = page.getViewport({ scale: DEFAULT_DPI_SCALE });
  const width = Math.ceil(viewport.width);
  const height = Math.ceil(viewport.height);
  const canvas = createCanvas(width, height);
  const context = canvas.getContext('2d');

  const renderContext = {
    canvasContext: context,
    viewport
  };

  await page.render(renderContext).promise;
  return canvas.toBuffer('image/png');
};

const createTesseractWorker = async () => {
  const worker = createWorker();
  await worker.load();
  await worker.loadLanguage('eng');
  await worker.initialize('eng');
  return worker;
};

export const extractTextWithOcr = async (pdfBuffer, fileName = 'unknown') => {
  const startTime = Date.now();
  let pdfDoc = null;
  let worker = null;
  let recognizedText = '';
  let pagesProcessed = 0;

  try {
    const uint8Array = pdfBuffer instanceof Uint8Array ? pdfBuffer : new Uint8Array(pdfBuffer);
    pdfDoc = await getDocument({ data: uint8Array }).promise;
    const pageCount = pdfDoc.numPages || 0;
    const maxPages = Math.min(pageCount, MAX_OCR_PAGES);

    worker = await createTesseractWorker();

    for (let pageNum = 1; pageNum <= maxPages; pageNum++) {
      if (Date.now() - startTime > MAX_OCR_DURATION_MS) {
        break;
      }

      try {
        const page = await pdfDoc.getPage(pageNum);
        const pageImage = await createPngBufferFromPage(page);
        const { data } = await worker.recognize(pageImage);
        recognizedText += `${data.text}\n`;
        pagesProcessed += 1;
      } catch (pageError) {
        console.warn(`[OCR_SERVICE] Page ${pageNum} OCR failed: ${pageError?.message}`);
      }
    }

    const extractedText = String(recognizedText).trim();
    const duration = Date.now() - startTime;
    const error = extractedText.length === 0 ? 'OCR succeeded but extracted no text' : null;

    return {
      text: extractedText,
      pages: pagesProcessed,
      duration,
      pageCount: pageCount,
      error
    };
  } catch (error) {
    const duration = Date.now() - startTime;
    const errorMessage = error?.message || String(error);

    return {
      text: '',
      pages: pagesProcessed,
      duration,
      pageCount: pdfDoc?.numPages || 0,
      error: `OCR extraction failed: ${errorMessage}`
    };
  } finally {
    if (worker) {
      try {
        await worker.terminate();
      } catch (terminateError) {
        console.warn('[OCR_SERVICE] Failed to terminate Tesseract worker:', terminateError?.message);
      }
    }

    if (pdfDoc) {
      try {
        pdfDoc.destroy();
      } catch (destroyError) {
        console.warn('[OCR_SERVICE] Failed to destroy pdfjs document:', destroyError?.message);
      }
    }
  }
};