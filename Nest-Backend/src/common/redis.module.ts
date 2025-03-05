import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config'; // ✅ Import ConfigModule
import { RedisService } from '../config/redis.config';

@Module({
  imports: [ConfigModule], // ✅ Add ConfigModule to imports
  providers: [RedisService],
  exports: [RedisService],
})
export class RedisModule {}
