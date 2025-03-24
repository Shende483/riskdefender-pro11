"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv = require("dotenv");
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const swagger_1 = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
dotenv.config();
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.enableCors({
        origin: process.env.FRONTEND_URL,
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
        credentials: true,
    });
    app.useGlobalPipes(new common_1.ValidationPipe());
    const config = new swagger_1.DocumentBuilder()
        .setTitle('Trading Terminal API')
        .setDescription('API Documentation for Trading Terminal')
        .setVersion('1.0')
        .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }, 'access-token')
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    document.paths = Object.keys(document.paths).reduce((acc, path) => {
        Object.keys(document.paths[path]).forEach((method) => {
            document.paths[path][method]['security'] = [{ 'access-token': [] }];
        });
        acc[path] = document.paths[path];
        return acc;
    }, {});
    swagger_1.SwaggerModule.setup('api-docs', app, document);
    const PORT = String(process.env.BACKEND_PORT);
    const IP_ADDRESS = String(process.env.BACKEND_IP);
    await app.listen(PORT, IP_ADDRESS);
    console.log(`✅ Server running on http://${IP_ADDRESS}:${PORT}`);
}
bootstrap();
//# sourceMappingURL=main.js.map