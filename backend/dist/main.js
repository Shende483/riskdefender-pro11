"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv = require("dotenv");
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const swagger_1 = require("@nestjs/swagger");
dotenv.config();
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.enableCors({
        origin: process.env.FRONTEND_URL,
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
        credentials: true,
    });
    const config = new swagger_1.DocumentBuilder()
        .setTitle('API Documentation')
        .setDescription('NestJS Project API documentation')
        .setVersion('1.0')
        .addBearerAuth()
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup('api', app, document);
    const PORT = String(process.env.BACKEND_PORT);
    const IP_ADDRESS = String(process.env.BACKEND_IP);
    await app.listen(PORT, IP_ADDRESS);
    console.log(`✅ Server running on http://${IP_ADDRESS}:${PORT}`);
}
bootstrap();
//# sourceMappingURL=main.js.map