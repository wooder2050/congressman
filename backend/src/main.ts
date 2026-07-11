import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const config = app.get(ConfigService);

  // Railway 프록시 뒤에서 Express의 req.ip가 실제 client IP를 가리키도록 함(로깅·폴백용).
  // rate limiter는 별도로 X-Real-IP를 tracker로 사용한다(RealIpThrottlerGuard 참고).
  app.set('trust proxy', true);

  // 보안 헤더. JSON API 서버이므로 CSP는 비활성화(HTML을 서빙하지 않음).
  app.use(helmet({ contentSecurityPolicy: false }));

  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));
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
