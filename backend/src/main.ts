



import * as dotenv from 'dotenv';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import {  ValidationPipe } from '@nestjs/common';

dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS for the configured IP
  app.enableCors({
    origin: process.env.FRONTEND_URL,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });


  app.useGlobalPipes(new ValidationPipe());

  // Swagger Configuration
  const config = new DocumentBuilder()
  .setTitle('Trading Terminal API')
  .setDescription('API Documentation for Trading Terminal')
  .setVersion('1.0')
  .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }, 'access-token') // Define Bearer Auth globally
  .build();

const document = SwaggerModule.createDocument(app, config);

// Apply Bearer Token Authentication to all API endpoints globally
document.paths = Object.keys(document.paths).reduce((acc, path) => {
  Object.keys(document.paths[path]).forEach((method) => {
    document.paths[path][method]['security'] = [{ 'access-token': [] }];
  });
  acc[path] = document.paths[path];
  return acc;
}, {});

SwaggerModule.setup('api-docs', app, document);


  const PORT = String(process.env.BACKEND_PORT);
  const IP_ADDRESS = String(process.env.BACKEND_IP);

  await app.listen(PORT, IP_ADDRESS);
  console.log(`✅ Server running on http://${IP_ADDRESS}:${PORT}`);
}
bootstrap();
