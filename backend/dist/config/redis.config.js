"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedisService = void 0;
const redis_1 = require("redis");
const config_1 = require("@nestjs/config");
exports.RedisService = {
    provide: 'REDIS_CLIENT',
    useFactory: async (configService) => {
        const client = (0, redis_1.createClient)({
            url: configService.get('REDIS_URL'),
        });
        client.on('error', (err) => console.error('Redis Error:', err));
        await client.connect();
        console.log('✅ Successfully connected to Redis');
        return client;
    },
    inject: [config_1.ConfigService],
};
//# sourceMappingURL=redis.config.js.map