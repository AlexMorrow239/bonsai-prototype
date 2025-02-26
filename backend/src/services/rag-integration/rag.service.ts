import { HttpService } from '@nestjs/axios';
import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { firstValueFrom } from 'rxjs';

import {
  FileProcessingRequest,
  FileProcessingResponse,
  RagServiceResponse,
} from './rag-service.interface';

@Injectable()
export class RagService {
  private readonly baseUrl: string;
  private readonly logger = new Logger(RagService.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService
  ) {
    this.baseUrl = this.configService.getOrThrow<string>('app.urls.llmService');
    this.logger.log(`RAG Service initialized with base URL: ${this.baseUrl}`);
  }

  async processFiles(
    request: FileProcessingRequest
  ): Promise<FileProcessingResponse> {
    try {
      // Validate request
      if (!Array.isArray(request.urls)) {
        throw new HttpException(
          'Invalid request: urls must be an array',
          HttpStatus.BAD_REQUEST
        );
      }

      this.logger.debug('Sending file processing request:', {
        numberOfUrls: request.urls.length,
        url: `${this.baseUrl}/ingest`,
      });

      const { data } = await firstValueFrom(
        this.httpService.post<RagServiceResponse>(
          `${this.baseUrl}/ingest`,
          request,
          {
            headers: {
              'Content-Type': 'application/json',
              Accept: 'application/json',
            },
            timeout: 60000, // 60 second timeout for file processing
          }
        )
      );

      // Validate response
      if (!data || !data.status || !Array.isArray(data.processedUrls)) {
        throw new HttpException(
          'Invalid response from RAG service',
          HttpStatus.BAD_GATEWAY
        );
      }

      this.logger.debug('Files successfully processed', {
        status: data.status,
        processedCount: data.processedUrls.length,
      });

      return data;
    } catch (error) {
      this.logger.error('Failed to process files:', {
        error: error.message,
        code: error.code,
        response: error.response?.data,
        url: `${this.baseUrl}/ingest`,
      });

      if (error.code === 'ECONNREFUSED') {
        throw new HttpException(
          'RAG service is not available',
          HttpStatus.SERVICE_UNAVAILABLE
        );
      }

      if (error.response?.status === 400) {
        throw new HttpException(
          'Invalid request to RAG service: ' +
            (error.response?.data?.error || error.message),
          HttpStatus.BAD_REQUEST
        );
      }

      throw new HttpException(
        'Failed to process files: ' + error.message,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
