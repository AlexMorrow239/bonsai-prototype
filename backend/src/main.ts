import { join } from 'path';
import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { HttpExceptionFilter } from '@/common/filters/http-exception-filter';
import { ErrorHandlingInterceptor } from '@/common/interceptors/error-handling.interceptor';
import { LoggingInterceptor } from '@/common/interceptors/logging.interceptor';
import { TransformInterceptor } from '@/common/interceptors/transform.interceptor';

import { AppModule } from './app.module';

async function bootstrap() {
  // Initialize app
  const app = (await NestFactory.create(AppModule)) as NestExpressApplication;

  // Get config service and setup logger
  const configService = app.get(ConfigService);
  const logger = new Logger('Bootstrap');

  logger.log('Starting application bootstrap...');

  try {
    // Configure global middleware
    configureGlobalMiddleware(app, logger);

    // Configure CORS
    configureCors(app, configService, logger);

    // Configure static file serving for uploads
    configureFileUploads(app, logger);

    // Configure and setup Swagger documentation
    setupSwagger(app, logger);

    // Start the server
    const port = configService.get('app.server.port');
    const host = configService.get('app.server.host');
    await app.listen(port, host);

    // Log server information
    await logServerInformation(app, port, logger);
  } catch (error) {
    logger.error('Failed to start application', error.stack);
    process.exit(1);
  }
}

function configureGlobalMiddleware(
  app: NestExpressApplication,
  logger: Logger
) {
  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      transformOptions: { enableImplicitConversion: true },
      whitelist: true,
      forbidNonWhitelisted: true,
      forbidUnknownValues: true,
    })
  );
  app.useGlobalInterceptors(
    new TransformInterceptor(),
    new LoggingInterceptor(),
    new ErrorHandlingInterceptor()
  );
  app.useGlobalFilters(new HttpExceptionFilter());
}

function configureCors(
  app: NestExpressApplication,
  configService: ConfigService,
  logger: Logger
) {
  const frontendUrl = configService.get('app.urls.frontend');
  logger.log(`Configuring CORS with frontend URL: ${frontendUrl}`);

  app.enableCors({
    origin: [
      frontendUrl,
      // Development URLs
      /^http:\/\/localhost:\d+$/,
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

function configureFileUploads(app: NestExpressApplication, logger: Logger) {
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/',
  });
  logger.log('File upload static serving configured at /uploads');
}

function setupSwagger(app: NestExpressApplication, logger: Logger) {
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
  app: NestExpressApplication,
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
