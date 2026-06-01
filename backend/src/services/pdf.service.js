import { promises as fs } from 'fs';
import os from 'os';
import path from 'path';
import { PDFParse } from 'pdf-parse';
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';
import { convertPdfPagesToPngs, cleanupTempDir } from './converter.service.js';
import { runOcrOnImages } from './ocr.service.js';

const MIN_TEXT_LENGTH = 150;
const MAX_OCR_PAGES = 6;
const OCR_TIMEOUT_MS = 28000;
const TEMP_PREFIX = 'resume-pdf-';

const createTempPdfFile = async (buffer, originalName = 'resume.pdf') => {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), TEMP_PREFIX));
  const safeName = path.basename(originalName).replace(/[^a-zA-Z0-9._-]/g, '_');
  const tempFile = path.join(tempDir, safeName);
  await fs.writeFile(tempFile, buffer);
  return tempFile;
};

const cleanupTempFile = async (tempFile) => {
  if (!tempFile) return;
  const tempDir = path.dirname(tempFile);
  await fs.rm(tempDir, { recursive: true, force: true }).catch(() => {});
};

const readFileBuffer = async (file) => {
  if (file?.buffer && Buffer.isBuffer(file.buffer)) {
    return file.buffer;
  }

  if (typeof file?.path === 'string') {
    return fs.readFile(file.path);
  }

  throw new Error('The uploaded resume must contain a file path or buffer.');
};

const normalizeText = (text) => String(text || '').trim();

const extractWithPdfParse = async (buffer) => {
  const startTime = Date.now();

  try {
    const parser = new PDFParse({ data: buffer });
    const pdfData = await parser.getText();
    const text = normalizeText(pdfData.text);
    return {
      text,
      pages: pdfData.numpages || pdfData.numPages || 0,
      durationMs: Date.now() - startTime,
      error: null
    };
  } catch (error) {
    return {
      text: '',
      pages: 0,
      durationMs: Date.now() - startTime,
      error: `pdf-parse failed: ${error?.message || String(error)}`
    };
  }
};

const extractWithPdfJs = async (buffer) => {
  const startTime = Date.now();

  try {
    const uint8Array = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
    const pdfDoc = await getDocument({ data: uint8Array }).promise;
    const pageCount = pdfDoc.numPages || 0;
    let allText = '';
    let successfulPages = 0;

    for (let pageNum = 1; pageNum <= pageCount; pageNum += 1) {
      try {
        const page = await pdfDoc.getPage(pageNum);
        const content = await page.getTextContent();
        const pageText = content.items.map((item) => item.str || '').join(' ');
        allText += `${pageText}\n`;
        successfulPages += 1;
      } catch (pageError) {
        console.warn(`[PDF_SERVICE] pdfjs page ${pageNum} extraction failed: ${pageError?.message}`);
      }
    }

    try {
      pdfDoc.destroy();
    } catch (ignore) {
      // ignore cleanup errors
    }

    return {
      text: normalizeText(allText),
      pages: successfulPages,
      durationMs: Date.now() - startTime,
      error: successfulPages === 0 ? 'pdfjs-dist failed to extract text from any page' : null
    };
  } catch (error) {
    return {
      text: '',
      pages: 0,
      durationMs: Date.now() - startTime,
      error: `pdfjs-dist failed: ${error?.message || String(error)}`
    };
  }
};

const extractWithOcr = async (pdfPath) => {
  const startTime = Date.now();
  const conversion = await convertPdfPagesToPngs(pdfPath, MAX_OCR_PAGES);

  try {
    const ocrResult = await runOcrOnImages(conversion.images, { timeoutMs: OCR_TIMEOUT_MS });
    return {
      text: normalizeText(ocrResult.text),
      pages: ocrResult.pagesProcessed,
      durationMs: Date.now() - startTime,
      error: ocrResult.error,
      ocrUsed: ocrResult.ocrUsed
    };
  } finally {
    await cleanupTempDir(conversion.tempDir);
  }
};

export const extractTextFromPdf = async (file) => {
  const startTime = Date.now();
  let tempPdfPath = null;
  let pdfPath = typeof file?.path === 'string' ? file.path : null;
  let buffer;

  try {
    buffer = await readFileBuffer(file);
    if (!Buffer.isBuffer(buffer) || buffer.length === 0) {
      throw new Error('Uploaded PDF is empty or unreadable.');
    }

    if (!pdfPath) {
      tempPdfPath = await createTempPdfFile(buffer, file?.originalname || 'resume.pdf');
      pdfPath = tempPdfPath;
    }

    const metadata = {
      filename: file?.originalname || file?.filename || 'unknown.pdf',
      filesize: typeof file?.size === 'number' ? file.size : buffer.length,
      stages: []
    };

    const stage1 = await extractWithPdfParse(buffer);
    metadata.stages.push({ stage: 1, parser: 'pdf-parse', pages: stage1.pages, textLength: stage1.text.length, durationMs: stage1.durationMs, success: stage1.text.length > MIN_TEXT_LENGTH, error: stage1.error });

    if (stage1.text.length > MIN_TEXT_LENGTH) {
      return {
        success: true,
        text: stage1.text,
        method: 'pdf-parse',
        pagesProcessed: stage1.pages,
        ocrUsed: false,
        processingTime: `${((Date.now() - startTime) / 1000).toFixed(2)}s`,
        metadata: { ...metadata, totalDurationMs: Date.now() - startTime, successStage: 1 }
      };
    }

    const stage2 = await extractWithPdfJs(buffer);
    metadata.stages.push({ stage: 2, parser: 'pdfjs-dist', pages: stage2.pages, textLength: stage2.text.length, durationMs: stage2.durationMs, success: stage2.text.length > MIN_TEXT_LENGTH, error: stage2.error });

    if (stage2.text.length > MIN_TEXT_LENGTH) {
      return {
        success: true,
        text: stage2.text,
        method: 'pdfjs',
        pagesProcessed: stage2.pages,
        ocrUsed: false,
        processingTime: `${((Date.now() - startTime) / 1000).toFixed(2)}s`,
        metadata: { ...metadata, totalDurationMs: Date.now() - startTime, successStage: 2 }
      };
    }

    const stage3 = await extractWithOcr(pdfPath);
    metadata.stages.push({ stage: 3, parser: 'ocr', pages: stage3.pages, textLength: stage3.text.length, durationMs: stage3.durationMs, success: stage3.text.length > MIN_TEXT_LENGTH, error: stage3.error });

    if (stage3.text.length > MIN_TEXT_LENGTH) {
      return {
        success: true,
        text: stage3.text,
        method: 'ocr',
        pagesProcessed: stage3.pages,
        ocrUsed: true,
        processingTime: `${((Date.now() - startTime) / 1000).toFixed(2)}s`,
        metadata: { ...metadata, totalDurationMs: Date.now() - startTime, successStage: 3 }
      };
    }

    return {
      success: false,
      text: stage3.text || stage2.text || stage1.text,
      method: 'ocr',
      pagesProcessed: stage3.pages || stage2.pages || stage1.pages,
      ocrUsed: true,
      processingTime: `${((Date.now() - startTime) / 1000).toFixed(2)}s`,
      metadata: { ...metadata, totalDurationMs: Date.now() - startTime, allStagesFailed: true },
      error: stage3.error || stage2.error || stage1.error || 'Unable to extract sufficient text from PDF.'
    };
  } catch (error) {
    return {
      success: false,
      text: '',
      method: 'ocr',
      pagesProcessed: 0,
      ocrUsed: false,
      processingTime: `${((Date.now() - startTime) / 1000).toFixed(2)}s`,
      metadata: { filename: file?.originalname || file?.filename || 'unknown.pdf', filesize: typeof file?.size === 'number' ? file.size : 0, error: error?.message || String(error) },
      error: error?.message || 'Failed to extract text from PDF.'
    };
  } finally {
    if (tempPdfPath) {
      await cleanupTempFile(tempPdfPath).catch(() => {});
    }
  }
};
