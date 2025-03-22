import { INestApplication } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { ApplicationModule } from './application.module';

import 'reflect-metadata/lite';

function setupOpenApi(application: INestApplication): void {
  const builder = new DocumentBuilder();
  const configuration = builder.build();
  const document = SwaggerModule.createDocument(application, configuration);

  SwaggerModule.setup('swagger', application, document);
}

async function bootstrap(): Promise<void> {
  const application = await NestFactory.create(ApplicationModule);

  setupOpenApi(application);

  application.enableCors({
    origin: ['http://localhost:8000'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    credentials: true,
  });

  await application.listen(8000);
}

bootstrap().catch((error) => {
  console.error(error);
});
