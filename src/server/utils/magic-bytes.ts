import crypto from 'crypto';

export interface FileSignatureResult {
  valid: boolean;
  detectedMime?: string;
  extension?: string;
  error?: string;
}

export function validateMagicBytes(buffer: Buffer): FileSignatureResult {
  if (!buffer || buffer.length < 4) {
    return { valid: false, error: 'Berkas kosong atau terlalu kecil.' };
  }

  // 1. PDF: %PDF- (hex: 25 50 44 46)
  if (
    buffer.length >= 4 &&
    buffer[0] === 0x25 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x44 &&
    buffer[3] === 0x46
  ) {
    return { valid: true, detectedMime: 'application/pdf', extension: 'pdf' };
  }

  // 2. JPEG: FF D8 FF
  if (
    buffer.length >= 3 &&
    buffer[0] === 0xff &&
    buffer[1] === 0xd8 &&
    buffer[2] === 0xff
  ) {
    return { valid: true, detectedMime: 'image/jpeg', extension: 'jpg' };
  }

  // 3. PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    buffer.length >= 8 &&
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    return { valid: true, detectedMime: 'image/png', extension: 'png' };
  }

  // 4. WebP: RIFF....WEBP (hex: 52 49 46 46 ... 57 45 42 50)
  if (
    buffer.length >= 12 &&
    buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46 &&
    buffer[8] === 0x57 && buffer[9] === 0x45 && buffer[10] === 0x42 && buffer[11] === 0x50
  ) {
    return { valid: true, detectedMime: 'image/webp', extension: 'webp' };
  }

  // 5. GIF: GIF87a or GIF89a (hex: 47 49 46 38 37/39 61)
  if (
    buffer.length >= 6 &&
    buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46 &&
    buffer[3] === 0x38 && (buffer[4] === 0x37 || buffer[4] === 0x39) && buffer[5] === 0x61
  ) {
    return { valid: true, detectedMime: 'image/gif', extension: 'gif' };
  }

  // 6. SVG: XML or SVG tag
  const textHeader = buffer.slice(0, 100).toString('utf-8').trim().toLowerCase();
  if (textHeader.startsWith('<svg') || textHeader.startsWith('<?xml')) {
    return { valid: true, detectedMime: 'image/svg+xml', extension: 'svg' };
  }

  return {
    valid: false,
    error: 'Format berkas tidak diizinkan. Hanya berkas PDF, JPG, PNG, WebP, GIF, atau SVG yang diterima.',
  };
}

export function computeSha256(buffer: Buffer): string {
  return crypto.createHash('sha256').update(buffer).digest('hex');
}
