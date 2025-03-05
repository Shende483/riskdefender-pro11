

/*
import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, RedisClientType } from 'redis';

@Injectable()
export class RedisService implements OnModuleInit {
  private client: RedisClientType;

  constructor(private readonly configService: ConfigService) {
    this.client = createClient({
      url: this.configService.get<string>('REDIS_URL'),
      legacyMode: true,
    });

    this.client.on('connect', () => {
      console.log('✅ Successfully connected to Redis');
    });

    this.client.on('error', (err) => {
      console.error('❌ Redis connection error:', err);
    });
  }

  async onModuleInit() {
    await this.client.connect();
  }

  getClient() {
    return this.client;
  }
}
*/




import { createClient } from 'redis';
import { ConfigService } from '@nestjs/config';

export const RedisService = {
  provide: 'REDIS_CLIENT',
  useFactory: async (configService: ConfigService) => {
    const client = createClient({
      url: configService.get<string>('REDIS_URL'),
    });

    client.on('error', (err) => console.error('Redis Error:', err));

    await client.connect();
    console.log('✅ Successfully connected to Redis');

    return client;
  },
  inject: [ConfigService],
};


/*
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, RedisClientType } from 'redis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private client: RedisClientType;

  constructor(private readonly configService: ConfigService) {
    this.client = createClient({
      url: this.configService.get<string>('REDIS_URL'),
      legacyMode: true,
    });

    this.client.on('connect', () => {
      console.log('✅ Successfully connected to Redis');
    });

    this.client.on('error', (err) => {
      console.error('❌ Redis connection error:', err);
    });
  }

  async onModuleInit() {
    await this.client.connect();
  }

  async onModuleDestroy() {
    await this.client.quit();
  }

  getClient(): RedisClientType {
    return this.client;
  }
}
*/