import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { AppModule } from './app.module';
import { HttpExceptionFilter } from '@/common/filters/http-exception-filter';
import { ErrorHandlingInterceptor } from '@/common/interceptors/error-handling.interceptor';
import { TransformInterceptor } from '@/common/interceptors/transform.interceptor';
import { LoggingInterceptor } from '@/common/interceptors/logging.interceptor';

async function bootstrap() {
  // Initialize app
  const app = await NestFactory.create(AppModule);

  // Get config service and setup logger
  const configService = app.get(ConfigService);
  const logger = new Logger('Bootstrap');

  logger.log('Starting application bootstrap...');

  try {
    // Configure global middleware
    configureGlobalMiddleware(app, logger);

    // Add request logging middleware
    configureRequestLogging(app, logger);

    // Configure CORS
    configureCors(app, configService, logger);

    // Configure and setup Swagger documentation
    setupSwagger(app, logger);

    // Start the server
    const port = configService.get<number>('PORT') || 3000;
    const host = '0.0.0.0';
    await app.listen(port, host);

    // Log server information
    await logServerInformation(app, port, logger);
  } catch (error) {
    logger.error('Failed to start application', error.stack);
    process.exit(1);
  }
}

function configureGlobalMiddleware(app: any, logger: Logger) {
  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    })
  );
  app.useGlobalInterceptors(
    new TransformInterceptor(),
    new LoggingInterceptor(),
    new ErrorHandlingInterceptor(),
  );  app.useGlobalFilters(new HttpExceptionFilter());
}

function configureRequestLogging(app: any, logger: Logger) {
  app.use((req: any, res: any, next: () => void) => {
    logger.debug(
      'Incoming request',
      JSON.stringify({
        method: req.method,
        url: req.url,
        headers: req.headers,
      })
    );

    // Capture response headers after they're set
    const oldEnd = res.end;
    res.end = function (...args: any[]) {
      logger.debug(
        'Outgoing response',
        JSON.stringify({
          statusCode: res.statusCode,
          headers: res.getHeaders(),
        })
      );
      return oldEnd.apply(res, args);
    };
    next();
  });
}

function configureCors(
  app: any,
  configService: ConfigService,
  logger: Logger
) {
  const frontendUrl = configService.get('url.frontend');
  logger.log(`Configuring CORS with frontend URL: ${frontendUrl}`);

  app.enableCors({
    origin: [
      frontendUrl,
      /^http:\/\/192\.168\.1\.\d{1,3}:\d+$/,
      'http://100.65.62.87:5173',
    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: ['Content-Type', 'Accept', 'Authorization'],
    exposedHeaders: ['Content-Disposition'],
    credentials: true,
    preflightContinue: false,
    optionsSuccessStatus: 204,
  });
}

function setupSwagger(app: any, logger: Logger) {
  const config = new DocumentBuilder()
    .setTitle('Bonsai API')
    .setDescription('Bonsai Swagger API')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  logger.log('Swagger documentation initialized at /api/docs');
}

async function logServerInformation(
  app: any,
  port: number,
  logger: Logger
) {
  const serverUrl = await app.getUrl();

  logger.log(
    `Server is running at:
    - Local:   http://localhost:${port}
    - IPv6:    ${serverUrl}
    - IPv4:    http://127.0.0.1:${port}
    - Swagger: http://localhost:${port}/api/docs`
  );
}

// Handle unhandled bootstrap errors
bootstrap().catch((error) => {
  console.error('Unhandled bootstrap error:', error);
  process.exit(1);
});
