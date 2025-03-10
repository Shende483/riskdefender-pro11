import * as dotenv from 'dotenv';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
 // app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  // ✅ Enable CORS
  app.enableCors({
    origin: 'http://localhost:3000', // Allow frontend
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true, // Allow cookies if needed
  });

  await app.listen(process.env.PORT || 3005);
  console.log(`✅ Server running on http://localhost:${process.env.PORT || 3005}`);
}
bootstrap();

