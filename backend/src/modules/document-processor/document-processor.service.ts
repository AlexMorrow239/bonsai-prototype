import { Buffer } from 'buffer';
import { Injectable, Logger } from '@nestjs/common';

import * as mammoth from 'mammoth';

@Injectable()
export class DocumentProcessorService {
  private readonly logger = new Logger(DocumentProcessorService.name);

  /**
   * Extracts text content from a Word document buffer
   * @param buffer The buffer containing the Word document
   * @returns The extracted text content
   */
  async extractTextFromWordDocument(buffer: Buffer): Promise<string> {
    try {
      const result = await mammoth.extractRawText({ buffer });
      return result.value.trim();
    } catch (error) {
      this.logger.error(
        `Failed to extract text from Word document: ${error.message}`
      );
      throw error;
    }
  }

  /**
   * Determines if a file is a Word document based on its mimetype
   * @param mimetype The mimetype of the file
   * @returns boolean indicating if the file is a Word document
   */
  isWordDocument(mimetype: string): boolean {
    const wordMimetypes = [
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
      'application/msword', // .doc
    ];
    return wordMimetypes.includes(mimetype);
  }
}
