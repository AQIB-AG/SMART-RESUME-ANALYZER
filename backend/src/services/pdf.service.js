import { PDFParse } from 'pdf-parse';
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';
import { extractTextWithOcr } from './ocr.service.js';

const MIN_TEXT_LENGTH = 100;

const validateBuffer = (pdfBuffer) => {
  if (!pdfBuffer || !(pdfBuffer instanceof Buffer || pdfBuffer instanceof Uint8Array)) {
    throw new Error('Invalid PDF buffer. Expecting Buffer or Uint8Array.');
  }
  if (pdfBuffer.length === 0) {
    throw new Error('PDF buffer is empty.');
  }
};

export const extractWithPdfParse = async (pdfBuffer) => {
  const startTime = Date.now();

  try {
    const parser = new PDFParse({ data: pdfBuffer });
    const textResult = await parser.getText();
    await parser.destroy();

    const extractedText = String(textResult.text || '').trim();
    const duration = Date.now() - startTime;

    return {
      text: extractedText,
      pages: textResult.total || 0,
      duration,
      error: null
    };
  } catch (error) {
    return {
      text: '',
      pages: 0,
      duration: Date.now() - startTime,
      error: `pdf-parse failed: ${error?.message || String(error)}`
    };
  }
};

export const extractWithPdfJs = async (pdfBuffer) => {
  const startTime = Date.now();

  try {
    if (globalThis.pdfjsWorker) {
      getDocument.workerSrc = null;
    }

    const uint8Array = pdfBuffer instanceof Uint8Array ? pdfBuffer : new Uint8Array(pdfBuffer);
    const pdfDoc = await getDocument({ data: uint8Array }).promise;
    const numPages = pdfDoc.numPages || 0;

    let allText = '';
    let successfulPages = 0;

    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
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
    } catch (destroyError) {
      console.warn('[PDF_SERVICE] Failed to destroy pdfjs document:', destroyError?.message);
    }

    const extractedText = String(allText).trim();
    const duration = Date.now() - startTime;

    return {
      text: extractedText,
      pages: successfulPages,
      duration,
      error: successfulPages === 0 ? 'pdfjs-dist failed to extract text from any page' : null
    };
  } catch (error) {
    return {
      text: '',
      pages: 0,
      duration: Date.now() - startTime,
      error: `pdfjs-dist failed: ${error?.message || String(error)}`
    };
  }
};

export const extractWithOcr = async (pdfBuffer, fileName = 'unknown') => {
  const startTime = Date.now();
  const ocrResult = await extractTextWithOcr(pdfBuffer, fileName);
  return {
    text: String(ocrResult.text || '').trim(),
    pages: ocrResult.pages || 0,
    duration: ocrResult.duration || Date.now() - startTime,
    error: ocrResult.error
  };
};

export const extractText = async (pdfBuffer, fileName = 'unknown', fileSize = 0) => {
  const pipelineStart = Date.now();
  const diagnostics = {
    filename: fileName,
    filesize: fileSize,
    stages: []
  };

  validateBuffer(pdfBuffer);

  const stage1 = await extractWithPdfParse(pdfBuffer);
  diagnostics.stages.push({
    stage: 1,
    parser: 'pdf-parse',
    pages: stage1.pages,
    textLength: stage1.text.length,
    duration: `${stage1.duration}ms`,
    success: stage1.text.length > MIN_TEXT_LENGTH,
    error: stage1.error
  });

  if (stage1.text.length > MIN_TEXT_LENGTH) {
    const totalDuration = Date.now() - pipelineStart;
    return {
      success: true,
      text: stage1.text,
      metadata: {
        ...diagnostics,
        totalDuration: `${totalDuration}ms`,
        parser: 'pdf-parse',
        successStage: 1
      },
      error: null
    };
  }

  const stage2 = await extractWithPdfJs(pdfBuffer);
  diagnostics.stages.push({
    stage: 2,
    parser: 'pdfjs-dist',
    pages: stage2.pages,
    textLength: stage2.text.length,
    duration: `${stage2.duration}ms`,
    success: stage2.text.length > MIN_TEXT_LENGTH,
    error: stage2.error
  });

  if (stage2.text.length > MIN_TEXT_LENGTH) {
    const totalDuration = Date.now() - pipelineStart;
    return {
      success: true,
      text: stage2.text,
      metadata: {
        ...diagnostics,
        totalDuration: `${totalDuration}ms`,
        parser: 'pdfjs-dist',
        successStage: 2
      },
      error: null
    };
  }

  const stage3 = await extractWithOcr(pdfBuffer, fileName);
  diagnostics.stages.push({
    stage: 3,
    parser: 'ocr',
    pages: stage3.pages,
    textLength: stage3.text.length,
    duration: `${stage3.duration}ms`,
    success: stage3.text.length > MIN_TEXT_LENGTH,
    error: stage3.error
  });

  const totalDuration = Date.now() - pipelineStart;

  if (stage3.text.length > MIN_TEXT_LENGTH) {
    return {
      success: true,
      text: stage3.text,
      metadata: {
        ...diagnostics,
        totalDuration: `${totalDuration}ms`,
        parser: 'ocr',
        successStage: 3
      },
      error: null
    };
  }

  return {
    success: false,
    text: stage3.text || stage2.text || stage1.text,
    metadata: {
      ...diagnostics,
      totalDuration: `${totalDuration}ms`,
      parser: 'ocr',
      allStagesFailed: true
    },
    error: 'Unable to extract sufficient text from this PDF. It may be scanned, encrypted, or have a non-standard layout.'
  };
};
