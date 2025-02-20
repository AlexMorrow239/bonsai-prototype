/**
 * Global error handling interceptor
 * Catches and processes unexpected errors, providing consistent error handling
 * and logging across the application
 */

import {
  CallHandler,
  ExecutionContext,
  Injectable,
  InternalServerErrorException,
  Logger,
  NestInterceptor,
} from '@nestjs/common';

import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class ErrorHandlingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(ErrorHandlingInterceptor.name);

  /**
   * Intercepts request/response cycle to handle unexpected errors
   * @param context Execution context
   * @param next Call handler for the route
   * @returns Observable that handles errors
   */
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      catchError((error) => {
        // Handle unexpected or internal server errors
        if (!error.status || error.status === 500) {
          this.logger.error('Unexpected error occurred', {
            error: error.message,
            stack: error.stack,
          });

          // Mask internal error details in production
          if (process.env.NODE_ENV === 'production') {
            error = new InternalServerErrorException(
              'An unexpected error occurred'
            );
          }
        }

        return throwError(() => error);
      })
    );
  }
}
