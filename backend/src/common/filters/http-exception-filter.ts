/**
 * Global HTTP exception filter
 * Handles all HTTP exceptions and provides consistent error response formatting
 * Includes logging for both client and server errors with contextual information
 */

import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  Logger,
} from "@nestjs/common";

import { Request, Response } from "express";

import { BaseException } from "../exceptions/base.exception";

interface ErrorResponse {
  statusCode: number;
  timestamp: string;
  path: string;
  method: string;
  message?: string;
  code?: string;
  details?: Record<string, any>;
  requestId?: string;
}

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  /**
   * Catches and processes HTTP exceptions
   * @param exception The caught exception
   * @param host Arguments host for accessing request/response
   */
  catch(exception: HttpException, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    const timestamp = new Date().toISOString();

    // Construct standardized error response
    const error: ErrorResponse = {
      statusCode: status,
      timestamp,
      path: request.url,
      method: request.method,
      ...this.getErrorResponse(exception),
      requestId: (request.headers["x-request-id"] as string) || undefined,
    };

    // Log error with context and send response
    this.logError(request, error, exception);
    response.status(status).json(error);
  }

  /**
   * Extracts and formats error response based on exception type
   * @param exception The HTTP exception
   * @returns Formatted error response object
   */
  private getErrorResponse(exception: HttpException): Partial<ErrorResponse> {
    const exceptionResponse = exception.getResponse();

    if (exception instanceof BaseException) {
      return {
        message: exceptionResponse["message"] || exceptionResponse,
        code: exception.code,
        details: exception.details,
      };
    }

    return typeof exceptionResponse === "object"
      ? exceptionResponse
      : { message: exceptionResponse };
  }

  /**
   * Logs error with appropriate severity and context
   * @param request Express request object
   * @param error Formatted error response
   * @param exception Original exception
   */
  private logError(
    request: Request,
    error: ErrorResponse,
    exception: HttpException
  ): void {
    const errorLog = {
      ...error,
      stack: exception.stack,
      headers: request.headers,
      query: request.query,
      body: request.body,
    };

    if (error.statusCode >= 500) {
      this.logger.error(
        `Server Error: ${request.method} ${request.url}`,
        errorLog
      );
    } else {
      this.logger.warn(
        `Client Error: ${request.method} ${request.url}`,
        errorLog
      );
    }
  }
}
