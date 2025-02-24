import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';

import { Observable } from 'rxjs';

import { DocumentProcessorService } from '@/modules/document-processor/document-processor.service';

@Injectable()
export class WordProcessorInterceptor implements NestInterceptor {
  constructor(private readonly documentProcessor: DocumentProcessorService) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler
  ): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();

    if (request.files && request.files.length > 0) {
      let messageData = request.body.messageData
        ? JSON.parse(request.body.messageData)
        : { content: '' };

      let extractedContent = '';

      for (const file of request.files) {
        if (this.documentProcessor.isWordDocument(file.mimetype)) {
          try {
            const textContent =
              await this.documentProcessor.extractTextFromWordDocument(
                file.buffer
              );
            extractedContent += textContent + '\n\n';
          } catch (error) {
            console.error(
              `Failed to process Word document ${file.originalname}:`,
              error
            );
            // Continue processing other files even if one fails
          }
        }
      }

      // Combine extracted content with original content
      if (extractedContent) {
        messageData.content = messageData.content
          ? `${messageData.content}\n\n${extractedContent.trim()}`
          : extractedContent.trim();

        request.body.messageData = JSON.stringify(messageData);
      }
    }

    return next.handle();
  }
}
