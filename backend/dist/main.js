"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv = require("dotenv");
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
dotenv.config();
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.enableCors({
        origin: process.env.FRONTEND_URL,
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
        credentials: true,
    });
    const PORT = String(process.env.BACKEND_PORT);
    const IP_ADDRESS = String(process.env.BACKEND_IP);
    await app.listen(PORT, IP_ADDRESS);
    console.log(`✅ Server running on http://${IP_ADDRESS}:${PORT}`);
}
bootstrap();
//# sourceMappingURL=main.js.map