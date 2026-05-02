import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);

  app.setGlobalPrefix('api');
  app.enableCors({
    origin: config.get('CORS_ORIGIN', 'http://localhost:3000'),
    credentials: true,
  });

  if (config.get('NODE_ENV', 'development') !== 'production') {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('국회의원 의정활동 API')
      .setDescription('대한민국 국회의원의 출석, 법안, 표결, 재산 등 의정활동 데이터 API')
      .setVersion('1.0')
      .build();

    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('api/docs', app, document);
  }

  const port = config.get('PORT', 4000);
  await app.listen(port);
}

bootstrap();
