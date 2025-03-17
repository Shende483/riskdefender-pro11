




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

