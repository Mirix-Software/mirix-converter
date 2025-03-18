import { type MiddlewareConsumer, Module, type NestModule } from '@nestjs/common';
import { APP_FILTER, APP_PIPE } from '@nestjs/core';
import { EventEmitterModule } from '@nestjs/event-emitter';

import { RequestStoreMiddleware, RequestStoreModule } from '@core-module/request-store';
import { GlobalExceptionFilter, RequestValidationPipe } from '@core/nest';
import { FfmpegWebsocketModule } from '@domain/ffmpeg/websocket';

import { ControllerModule } from './controller.module';

@Module({
  imports: [
    RequestStoreModule,
    ControllerModule,
    FfmpegWebsocketModule,
    EventEmitterModule.forRoot({
      wildcard: true,
      delimiter: '.',
      maxListeners: 20,
    }),
  ],

  providers: [
    {
      provide: APP_PIPE,
      useClass: RequestValidationPipe,
    },

    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
  ],
})
class ApplicationModule implements NestModule {
  public configure(consumer: MiddlewareConsumer): void {
    consumer.apply(RequestStoreMiddleware).forRoutes('*');
  }
}

export { ApplicationModule };
