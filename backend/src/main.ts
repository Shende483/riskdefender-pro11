
import * as dotenv from 'dotenv';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS for the configured IP
  app.enableCors({
    origin: process.env.FRONTEND_URL,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  const PORT = String(process.env.BACKEND_PORT) ;
  const IP_ADDRESS = String(process.env.BACKEND_IP);

  await app.listen(PORT, IP_ADDRESS);
  console.log(`✅ Server running on http://${IP_ADDRESS}:${PORT}`);
}
bootstrap();
