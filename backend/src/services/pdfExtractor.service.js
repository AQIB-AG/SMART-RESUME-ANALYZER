/**
 * Multi-stage PDF text extraction service
 * Implements fallback pipeline:
 * Stage 1: pdf-parse (fast, works for most PDFs)
 * Stage 2: pdfjs-dist (handles PDFs with embedded fonts)
 */

import { PDFParse } from 'pdf-parse';
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';

const MIN_TEXT_LENGTH = 200;

/**
 * Stage 1: Extract text using pdf-parse
 * Fast extraction for text-based PDFs
 * @param {Buffer} pdfBuffer - PDF file buffer
 * @returns {Promise<{text: string, pages: number, duration: number, error: string|null}>}
 */
export const extractWithPdfParse = async (pdfBuffer) => {
  const startTime = Date.now();
  try {
    const parser = new PDFParse({ data: pdfBuffer });
    const textResult = await parser.getText();
    const infoResult = await parser.getInfo();
    await parser.destroy();

    const extractedText = String(textResult.text).trim();
    const duration = Date.now() - startTime;

    return {
      text: extractedText,
      pages: textResult.total,
      duration,
      error: null
    };
  } catch (error) {
    const duration = Date.now() - startTime;
    const errorMsg = error?.message || String(error);
    return {
      text: '',
      pages: 0,
      duration,
      error: `pdf-parse failed: ${errorMsg}`
    };
  }
};

/**
 * Stage 2: Extract text using pdfjs-dist (pdfjs)
 * Handles PDFs with embedded fonts and complex layouts
 * Extracts page by page for better reliability
 * @param {Buffer} pdfBuffer - PDF file buffer
 * @returns {Promise<{text: string, pages: number, duration: number, error: string|null}>}
 */
export const extractWithPdfJs = async (pdfBuffer) => {
  const startTime = Date.now();
  try {
    // Set up pdfjs worker
    if (globalThis.pdfjsWorker) {
      getDocument.workerSrc = null;
    }

    const uint8Array = pdfBuffer instanceof Uint8Array 
      ? pdfBuffer 
      : new Uint8Array(pdfBuffer);

    const pdfDoc = await getDocument({ data: uint8Array }).promise;
    const numPages = pdfDoc.numPages || 0;

    let allText = '';
    let successfulPages = 0;

    // Extract text from each page separately for robustness
    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
      try {
        const page = await pdfDoc.getPage(pageNum);
        const content = await page.getTextContent();

        const pageText = content.items
          .map((item) => item.str || '')
          .join(' ');

        allText += pageText + '\n';
        successfulPages++;
      } catch (pageError) {
        // Log page error but continue to next page
        console.warn(`[PDF_EXTRACT] pdfjs page ${pageNum} extraction failed: ${pageError?.message}`);
        continue;
      }
    }

    // Clean up
    try {
      pdfDoc.destroy();
    } catch (e) {
      // Ignore cleanup errors
    }

    const extractedText = String(allText).trim();
    const duration = Date.now() - startTime;

    return {
      text: extractedText,
      pages: successfulPages,
      duration,
      error: successfulPages === 0 ? 'pdfjs: no pages successfully extracted' : null
    };
  } catch (error) {
    const duration = Date.now() - startTime;
    const errorMsg = error?.message || String(error);
    return {
      text: '',
      pages: 0,
      duration,
      error: `pdfjs failed: ${errorMsg}`
    };
  }
};

/**
 * Stage 3: Extract using alternative methods (reserved for future enhancements)
 * Could use: image-based OCR, alternative parsers, etc.
 * @param {Buffer} pdfBuffer - PDF file buffer
 * @returns {Promise<{text: string, pages: number, duration: number, error: string|null}>}
 */
export const extractWithAlternative = async (pdfBuffer) => {
  const startTime = Date.now();
  const duration = Date.now() - startTime;
  
  // Reserved for future OCR or alternative extraction methods
  return {
    text: '',
    pages: 0,
    duration,
    error: 'Alternative extraction method not implemented'
  };
};

/**
 * Main extraction orchestrator
 * Tries each extraction method in sequence until sufficient text is extracted
 * @param {Buffer} pdfBuffer - PDF file buffer
 * @param {string} fileName - Original filename (for logging)
 * @param {number} fileSize - File size in bytes (for logging)
 * @returns {Promise<{success: boolean, text: string, metadata: object, error: string|null}>}
 */
export const extractText = async (pdfBuffer, fileName = 'unknown', fileSize = 0) => {
  const pipelineStart = Date.now();
  const diagnostics = {
    filename: fileName,
    filesize: fileSize,
    stages: []
  };

  try {
    // Validate input
    if (!pdfBuffer || !(pdfBuffer instanceof Buffer || pdfBuffer instanceof Uint8Array)) {
      return {
        success: false,
        text: '',
        metadata: { ...diagnostics, error: 'Invalid PDF buffer' },
        error: 'Invalid PDF buffer provided'
      };
    }

    if (pdfBuffer.length === 0) {
      return {
        success: false,
        text: '',
        metadata: { ...diagnostics, error: 'Empty PDF buffer' },
        error: 'PDF buffer is empty'
      };
    }

    console.log('[PDF_EXTRACT] Starting extraction pipeline:', {
      filename: fileName,
      filesize: fileSize,
      bufferLength: pdfBuffer.length,
      timestamp: new Date().toISOString()
    });

    // ========== STAGE 1: pdf-parse ==========
    console.log('[PDF_EXTRACT] STAGE 1: Attempting pdf-parse extraction');
    const stage1Result = await extractWithPdfParse(pdfBuffer);

    diagnostics.stages.push({
      stage: 1,
      parser: 'pdf-parse',
      pages: stage1Result.pages,
      textLength: stage1Result.text.length,
      duration: `${stage1Result.duration}ms`,
      success: stage1Result.text.length > MIN_TEXT_LENGTH,
      error: stage1Result.error
    });

    if (stage1Result.text.length > MIN_TEXT_LENGTH) {
      const totalDuration = Date.now() - pipelineStart;
      console.log('[PDF_EXTRACT] SUCCESS at Stage 1', {
        filename: fileName,
        parser: 'pdf-parse',
        pages: stage1Result.pages,
        textLength: stage1Result.text.length,
        duration: `${totalDuration}ms`,
        first500chars: stage1Result.text.substring(0, 500)
      });

      return {
        success: true,
        text: stage1Result.text,
        metadata: {
          ...diagnostics,
          totalDuration: `${totalDuration}ms`,
          parser: 'pdf-parse',
          successStage: 1
        },
        error: null
      };
    }

    console.log('[PDF_EXTRACT] STAGE 1 insufficient text, moving to Stage 2');

    // ========== STAGE 2: pdfjs-dist ==========
    console.log('[PDF_EXTRACT] STAGE 2: Attempting pdfjs-dist extraction');
    const stage2Result = await extractWithPdfJs(pdfBuffer);

    diagnostics.stages.push({
      stage: 2,
      parser: 'pdfjs-dist',
      pages: stage2Result.pages,
      textLength: stage2Result.text.length,
      duration: `${stage2Result.duration}ms`,
      success: stage2Result.text.length > MIN_TEXT_LENGTH,
      error: stage2Result.error
    });

    if (stage2Result.text.length > MIN_TEXT_LENGTH) {
      const totalDuration = Date.now() - pipelineStart;
      console.log('[PDF_EXTRACT] SUCCESS at Stage 2', {
        filename: fileName,
        parser: 'pdfjs-dist',
        pages: stage2Result.pages,
        textLength: stage2Result.text.length,
        duration: `${totalDuration}ms`,
        first500chars: stage2Result.text.substring(0, 500)
      });

      return {
        success: true,
        text: stage2Result.text,
        metadata: {
          ...diagnostics,
          totalDuration: `${totalDuration}ms`,
          parser: 'pdfjs-dist',
          successStage: 2
        },
        error: null
      };
    }

    console.log('[PDF_EXTRACT] STAGE 2 insufficient text');

    // ========== BOTH STAGES FAILED ==========
    const totalDuration = Date.now() - pipelineStart;
    console.error('[PDF_EXTRACT] FAILED at both extraction stages', {
      filename: fileName,
      filesize: fileSize,
      stage1: `${stage1Result.text.length} chars (${stage1Result.duration}ms)`,
      stage2: `${stage2Result.text.length} chars (${stage2Result.duration}ms)`,
      totalDuration: `${totalDuration}ms`
    });

    return {
      success: false,
      text: '',
      metadata: {
        ...diagnostics,
        totalDuration: `${totalDuration}ms`,
        allStagesFailed: true
      },
      error: 'Unable to extract text from PDF after both extraction methods failed. PDF may be corrupted, scanned, or contain only images without text content.'
    };
  } catch (error) {
    const totalDuration = Date.now() - pipelineStart;
    const errorMsg = error?.message || String(error);

    console.error('[PDF_EXTRACT] Unexpected error in extraction pipeline', {
      filename: fileName,
      error: errorMsg,
      stack: error?.stack,
      duration: `${totalDuration}ms`
    });

    return {
      success: false,
      text: '',
      metadata: {
        ...diagnostics,
        totalDuration: `${totalDuration}ms`,
        unexpectedError: true
      },
      error: `PDF extraction pipeline error: ${errorMsg}`
    };
  }
};

export default {
  extractText,
  extractWithPdfParse,
  extractWithPdfJs
};
