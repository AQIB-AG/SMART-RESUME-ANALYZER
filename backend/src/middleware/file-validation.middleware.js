import fs from 'fs';
import path from 'path';

/**
 * Middleware to validate file magic bytes/signatures to prevent malicious files
 * with masqueraded extensions (e.g. executable renamed as .pdf).
 */
export const validateFileSignature = (req, res, next) => {
  if (!req.file) {
    return next();
  }

  const filePath = req.file.path;
  const ext = path.extname(req.file.originalname || '').toLowerCase();

  try {
    if (!fs.existsSync(filePath)) {
      return res.status(400).json({
        success: false,
        error: 'Uploaded file not found on disk.'
      });
    }

    const fd = fs.openSync(filePath, 'r');
    const buffer = Buffer.alloc(8);
    fs.readSync(fd, buffer, 0, 8, 0);
    fs.closeSync(fd);

    const hex = buffer.toString('hex').toUpperCase();
    let isValid = false;

    if (ext === '.pdf') {
      // PDF starts with %PDF (25504446)
      isValid = hex.startsWith('25504446');
    } else if (ext === '.png') {
      // PNG starts with 89504E47
      isValid = hex.startsWith('89504E47');
    } else if (ext === '.jpg' || ext === '.jpeg') {
      // JPEG starts with FFD8FF
      isValid = hex.startsWith('FFD8FF');
    } else if (ext === '.docx') {
      // DOCX (Zip format) starts with 504B0304 (PK..)
      isValid = hex.startsWith('504B0304');
    }

    if (!isValid) {
      console.warn(`⚠️ Security warning: File signature check failed for ${req.file.originalname} (Header: ${hex})`);
      // Delete the invalid file
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      return res.status(400).json({
        success: false,
        error: 'Security validation failed: File signature does not match file extension.'
      });
    }

    next();
  } catch (error) {
    console.error('❌ Error verifying file signature:', error);
    if (req.file && req.file.path && fs.existsSync(req.file.path)) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (unlinkErr) {
        console.error('Failed to unlink file on verification error:', unlinkErr);
      }
    }
    return res.status(400).json({
      success: false,
      error: 'Security validation failed: Could not parse file signature.'
    });
  }
};
