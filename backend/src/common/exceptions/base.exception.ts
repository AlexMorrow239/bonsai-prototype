/**
 * Base exception class for custom application exceptions
 * Extends NestJS HttpException with additional properties for error handling
 */
import { HttpException } from "@nestjs/common";

export class BaseException extends HttpException {
  /**
   * Creates a new base exception
   * @param response Error message or object containing error details
   * @param status HTTP status code
   * @param code Custom error code for client-side handling
   * @param details Additional error details
   */
  constructor(
    response: string | Record<string, any>,
    status: number,
    public readonly code?: string,
    public readonly details?: Record<string, any>
  ) {
    super(response, status);
  }
}
