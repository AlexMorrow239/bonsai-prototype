import { HttpService } from '@nestjs/axios';
import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { firstValueFrom } from 'rxjs';

import {
  FileIngestionRequest,
  FileIngestionResponse,
  LlmServiceResponse,
  QueryRequest,
  QueryResponse,
} from './llm-service.interface';

@Injectable()
export class LlmService {
  private readonly baseUrl: string;
  private readonly logger = new Logger(LlmService.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService
  ) {
    this.baseUrl = this.configService.getOrThrow<string>('app.urls.llmService');
    this.logger.log(`LLM Service initialized with base URL: ${this.baseUrl}`);
  }

  async query(request: QueryRequest): Promise<QueryResponse> {
    try {
      // Validate and sanitize the request
      if (!request.query || typeof request.query !== 'string') {
        throw new HttpException(
          'Invalid query: query must be a non-empty string',
          HttpStatus.BAD_REQUEST
        );
      }

      if (!request.chatId) {
        throw new HttpException(
          'Invalid request: chatId is required',
          HttpStatus.BAD_REQUEST
        );
      }

      const requestBody = {
        query: request.query,
        chat_id: request.chatId,
      };

      this.logger.debug('Sending query to LLM service:', {
        query: requestBody.query.substring(0, 50) + '...',
        chatId: requestBody.chat_id,
        url: `${this.baseUrl}/chat`,
      });

      const { data } = await firstValueFrom(
        this.httpService.post<LlmServiceResponse>(
          `${this.baseUrl}/chat`,
          requestBody,
          {
            headers: {
              'Content-Type': 'application/json',
              Accept: 'application/json',
            },
            timeout: 3000000, // 30 second timeout
          }
        )
      );

      // Validate response data
      if (!data || !data.answer) {
        throw new HttpException(
          'Invalid response from LLM service',
          HttpStatus.BAD_GATEWAY
        );
      }

      this.logger.debug('Received response from LLM service', {
        responseLength: data.answer.length,
      });

      return {
        llmResponse: data.answer,
        updatedSummary: '', // We no longer use summaries
      };
    } catch (error) {
      this.logger.error('Failed to communicate with LLM service:', {
        error: error.message,
        code: error.code,
        response: error.response?.data,
        url: `${this.baseUrl}/chat`,
        requestBody: request,
      });

      if (error.code === 'ECONNREFUSED') {
        throw new HttpException(
          'LLM service is not available',
          HttpStatus.SERVICE_UNAVAILABLE
        );
      }

      if (error.response?.status === 400) {
        throw new HttpException(
          'Invalid request to LLM service: ' +
            (error.response?.data?.error || error.message),
          HttpStatus.BAD_REQUEST
        );
      }

      throw new HttpException(
        'Failed to communicate with LLM service: ' + error.message,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async ingestFiles(
    request: FileIngestionRequest
  ): Promise<FileIngestionResponse> {
    try {
      // Validate request
      if (!Array.isArray(request.urls)) {
        throw new HttpException(
          'Invalid request: urls must be an array',
          HttpStatus.BAD_REQUEST
        );
      }

      this.logger.debug('Sending file ingestion request:', {
        numberOfUrls: request.urls.length,
        url: `${this.baseUrl}/api/ingest-files`,
      });

      const { data } = await firstValueFrom(
        this.httpService.post<FileIngestionResponse>(
          `${this.baseUrl}/api/ingest-files`,
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
          'Invalid response from LLM service',
          HttpStatus.BAD_GATEWAY
        );
      }

      this.logger.debug('Files successfully ingested', {
        status: data.status,
        processedCount: data.processedUrls.length,
      });

      return data;
    } catch (error) {
      this.logger.error('Failed to ingest files:', {
        error: error.message,
        code: error.code,
        response: error.response?.data,
        url: `${this.baseUrl}/api/ingest-files`,
      });

      if (error.code === 'ECONNREFUSED') {
        throw new HttpException(
          'LLM service is not available',
          HttpStatus.SERVICE_UNAVAILABLE
        );
      }

      if (error.response?.status === 400) {
        throw new HttpException(
          'Invalid request to LLM service: ' +
            (error.response?.data?.error || error.message),
          HttpStatus.BAD_REQUEST
        );
      }

      throw new HttpException(
        'Failed to ingest files: ' + error.message,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
