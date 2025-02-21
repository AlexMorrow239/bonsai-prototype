import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, body } = request;
    const startTime = Date.now();

    // Log incoming request
    this.logger.debug(`Incoming ${method} ${url}`, {
      body,
      // Only log essential headers
      headers: this.filterHeaders(request.headers),
    });

    return next.handle().pipe(
      tap((response) => {
        const duration = Date.now() - startTime;

        // Unwrap nested response structure
        const cleanResponse = this.cleanResponse(response);

        this.logger.debug(`Outgoing ${method} ${url} [${duration}ms]`, {
          statusCode: context.switchToHttp().getResponse().statusCode,
          response: cleanResponse,
        });
      }),
    );
  }

  private filterHeaders(headers: Record<string, any>): Record<string, any> {
    const relevantHeaders = [
      'content-type',
      'user-agent',
      'accept',
      'origin',
      'referer',
    ];
    return Object.fromEntries(
      Object.entries(headers).filter(([key]) =>
        relevantHeaders.includes(key.toLowerCase())
      )
    );
  }

  private cleanResponse(response: any): any {
    // Handle the nested data structure from TransformInterceptor
    if (response?.data?.data) {
      return response.data.data;
    }
    if (response?.data) {
      return response.data;
    }
    return response;
  }
}