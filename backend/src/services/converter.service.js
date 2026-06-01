import { promises as fs } from 'fs';
import os from 'os';
import path from 'path';
import pdfPoppler from 'pdf-poppler';

const MAX_OCR_PAGES = 6;
const DEFAULT_DPI = 200;

const makeTempDir = async () => {
  return fs.mkdtemp(path.join(os.tmpdir(), 'pdf-convert-'));
};

export const convertPdfPagesToPngs = async (pdfPath, maxPages = MAX_OCR_PAGES) => {
  const tempDir = await makeTempDir();
  const outPrefix = 'page';
  const convertOptions = {
    format: 'png',
    out_dir: tempDir,
    out_prefix: outPrefix,
    page: `1-${maxPages}`,
    dpi: DEFAULT_DPI
  };

  try {
    await pdfPoppler.convert(pdfPath, convertOptions);
    const files = await fs.readdir(tempDir);
    const images = files
      .filter((file) => file.toLowerCase().endsWith('.png'))
      .sort((left, right) => {
        const leftNumber = Number((left.match(/(\d+)(?=\.png$)/) || [0])[0]);
        const rightNumber = Number((right.match(/(\d+)(?=\.png$)/) || [0])[0]);
        return leftNumber - rightNumber;
      })
      .map((file) => path.join(tempDir, file));

    return { images, tempDir };
  } catch (error) {
    await cleanupTempDir(tempDir).catch(() => {});
    throw new Error(`PDF conversion failed: ${error?.message || String(error)}`);
  }
};

export const cleanupTempDir = async (tempDir) => {
  if (!tempDir) {
    return;
  }

  await fs.rm(tempDir, { recursive: true, force: true }).catch(() => {});
};
