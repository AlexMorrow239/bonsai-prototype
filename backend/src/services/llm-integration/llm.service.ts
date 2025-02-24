import { HttpService } from '@nestjs/axios';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { firstValueFrom } from 'rxjs';

import {
  FileIngestionRequest,
  FileIngestionResponse,
  QueryRequest,
  QueryResponse,
} from './llm-service.interface';

@Injectable()
export class LlmService {
  private readonly baseUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService
  ) {
    // In production, this would come from environment variables
    this.baseUrl = 'http://localhost:3002';
  }

  async query(request: QueryRequest): Promise<QueryResponse> {
    try {
      const { data } = await firstValueFrom(
        this.httpService.post<QueryResponse>(
          `${this.baseUrl}/api/query`,
          request
        )
      );
      return data;
    } catch (error) {
      throw new HttpException(
        'Failed to communicate with LLM service',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async ingestFiles(
    request: FileIngestionRequest
  ): Promise<FileIngestionResponse> {
    try {
      const { data } = await firstValueFrom(
        this.httpService.post<FileIngestionResponse>(
          `${this.baseUrl}/api/ingest-files`,
          request
        )
      );
      return data;
    } catch (error) {
      throw new HttpException(
        'Failed to ingest files',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
