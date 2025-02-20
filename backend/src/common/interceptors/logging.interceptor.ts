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
    const { method, url, body, headers } = request;
    const startTime = Date.now();

    return next.handle().pipe(
      tap((response) => {
        const endTime = Date.now();
        this.logger.debug(
          `${method} ${url} ${endTime - startTime}ms`,
          {
            request: { method, url, body, headers },
            response,
            duration: `${endTime - startTime}ms`,
          }
        );
      }),
    );
  }
}