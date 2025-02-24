/**
 * Utility class for standardized error handling across services
 * Provides centralized error processing, logging, and transformation
 */
import {
  BadRequestException,
  HttpException,
  HttpStatus,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  Type,
  UnauthorizedException,
} from '@nestjs/common';

import { MongoServerError } from 'mongodb';

export class ErrorHandler {
  /**
   * Handles service-level errors with consistent logging and error transformation
   *
   * @param logger logger instance for error logging
   * @param error The caught error
   * @param context Description of the operation that failed
   * @param details Additional error context details
   * @param knownErrors Array of error types that should be rethrown without transformation
   * @throws The original error if it's in knownErrors, otherwise an InternalServerErrorException
   *
   * @example
   * try {
   *   await this.userService.updateUser(userId, data);
   * } catch (error) {
   *   ErrorHandler.handleServiceError(
   *     this.logger,
   *     error,
   *     'update user',
   *     { userId, data },
   *     [NotFoundException]
   *   );
   * }
   */
  static handleServiceError(
    logger: Logger,
    error: Error,
    context: string,
    details?: Record<string, any>,
    knownErrors: Type<Error>[] = [
      NotFoundException,
      UnauthorizedException,
      BadRequestException,
    ]
  ): never {
    // Prepare structured log data
    const logData = {
      operation: context,
      errorType: error?.constructor?.name || 'UnknownError',
      errorMessage: error?.message || 'Unknown error occurred',
      ...details,
    };

    // Handle JWT token expiration
    if (error.name === 'TokenExpiredError') {
      logger.warn(`Token expired: ${JSON.stringify(logData)}`);
      throw new UnauthorizedException({
        message: 'Your session has expired',
        expired: true,
      });
    }

    // Known errors - specifically handle NotFoundException
    if (error instanceof NotFoundException) {
      logger.warn(
        `Resource not found during ${context}: ${JSON.stringify(logData)}`
      );
      throw error;
    }

    // Other known errors
    if (knownErrors.some((errorType) => error instanceof errorType)) {
      logger.warn(
        `Known error occurred during ${context}: ${JSON.stringify(logData)}`
      );
      throw error;
    }

    // MongoDB errors
    if (error instanceof MongoServerError) {
      if (error.code === 11000) {
        logger.warn(
          `Duplicate key error: ${JSON.stringify({ ...logData, mongoError: error.code })}`
        );
        throw new BadRequestException(
          'A record with this information already exists'
        );
      }
      logger.error(
        `MongoDB error: ${JSON.stringify({ ...logData, mongoError: error.code })}`
      );
    }

    // HTTP exceptions
    if (error instanceof HttpException) {
      logger.error(
        `HTTP exception: ${JSON.stringify({ ...logData, statusCode: error.getStatus() })}`
      );
      throw error;
    }

    // Unknown errors
    logger.error(
      `Unhandled error: ${JSON.stringify({ ...logData, severity: 'CRITICAL' })}`
    );
    throw new InternalServerErrorException({
      message: `Failed to ${context}`,
      errorId: new Date().toISOString(),
    });
  }
}
