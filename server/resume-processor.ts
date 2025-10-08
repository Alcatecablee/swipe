import { extractText } from 'unpdf';
import Tesseract from 'tesseract.js';

export async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  try {
    const uint8Array = new Uint8Array(buffer);
    const { text } = await extractText(uint8Array, { mergePages: true });
    return text;
  } catch (error) {
    console.error('PDF extraction error:', error);
    throw new Error('Failed to extract text from PDF');
  }
}

export async function extractTextFromImage(buffer: Buffer): Promise<string> {
  let worker;
  try {
    worker = await Tesseract.createWorker('eng');
    const { data: { text } } = await worker.recognize(buffer);
    await worker.terminate();
    return text;
  } catch (error) {
    if (worker) {
      await worker.terminate();
    }
    console.error('OCR error:', error);
    throw new Error('Failed to extract text from image');
  }
}

export async function processResumeFile(buffer: Buffer, mimeType: string): Promise<string> {
  if (mimeType === 'application/pdf') {
    return await extractTextFromPDF(buffer);
  } else if (mimeType.startsWith('image/')) {
    return await extractTextFromImage(buffer);
  } else {
    throw new Error('Unsupported file type. Please upload a PDF or image file.');
  }
}
