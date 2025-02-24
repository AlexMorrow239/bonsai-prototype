import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { MongooseModule } from '@nestjs/mongoose';

import { TransformInterceptor } from '@/common/interceptors/transform.interceptor';
import { configValidationSchema } from '@/config/config.schema';
import configuration from '@/config/configuration';
import { ChatModule } from '@/modules/chat/chat.module';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HttpExceptionFilter } from './common/filters/http-exception-filter';
import { ErrorHandlingInterceptor } from './common/interceptors/error-handling.interceptor';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { FilesModule } from './modules/files/files.module';
import { ProjectsModule } from './modules/projects/projects.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: configValidationSchema,
      load: [configuration],
    }),
    MongooseModule.forRootAsync({
      useFactory: async () => ({
        uri: process.env.MONGODB_URI,
      }),
    }),
    ChatModule,
    ProjectsModule,
    FilesModule,
  ],
  controllers: [AppController],
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
