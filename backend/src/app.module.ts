import { Module } from '@nestjs/common';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { HttpExceptionFilter } from './common/filters/http-exception-filter';
import { ErrorHandlingInterceptor } from './common/interceptors/error-handling.interceptor';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { configValidationSchema } from '@/config/config.schema';
import { databaseConfig } from '@/config/configuration';
import { MongooseModule } from '@nestjs/mongoose';
import { TransformInterceptor } from '@/common/interceptors/transform.interceptor';
import { ChatModule } from '@/modules/chat/chat.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: configValidationSchema,
      load: [databaseConfig],
    }),
    MongooseModule.forRootAsync({
      useFactory: async () => ({
        uri: process.env.MONGODB_URI,
      }),
    }),
    ChatModule
  ],  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ErrorHandlingInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },
  ],
})
export class AppModule {}