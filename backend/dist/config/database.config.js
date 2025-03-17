"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseConfig = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const config_1 = require("@nestjs/config");
exports.DatabaseConfig = mongoose_1.MongooseModule.forRootAsync({
    imports: [config_1.ConfigModule],
    inject: [config_1.ConfigService],
    useFactory: async (configService) => {
        try {
            const uri = configService.get('MONGO_URI');
            if (!uri) {
                throw new Error('❌ MONGO_URI is not defined in environment variables');
            }
            console.log('✅ Successfully connected to MongoDB Atlas');
            return { uri, useNewUrlParser: true, useUnifiedTopology: true };
        }
        catch (error) {
            console.error('❌ Failed to connect to MongoDB Atlas:', error.message);
            throw error;
        }
    },
});
//# sourceMappingURL=database.config.js.map