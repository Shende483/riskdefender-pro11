"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JwtAuthGuard = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
let JwtAuthGuard = class JwtAuthGuard {
    jwtService;
    constructor(jwtService) {
        this.jwtService = jwtService;
    }
    async canActivate(context) {
        const request = context.switchToHttp().getRequest();
        const response = context.switchToHttp().getResponse();
        const token = request.headers.authorization?.split(' ')[1];
        console.log("🟢 Received Token:", token);
        if (!token) {
            response.status(401).json({
                statusCode: 401,
                message: '❌ Token is required, Please login First...',
                success: false
            });
            return false;
        }
        try {
            const decoded = await this.jwtService.verifyAsync(token);
            if (!decoded) {
                response.status(401).json({
                    statusCode: 401,
                    message: '❌ Invalid token payload',
                    success: false
                });
                return false;
            }
            console.log("✅ Decoded Token:", decoded);
            request['user'] = {
                userId: decoded.id,
                email: decoded.email,
                mobile: decoded.mobile
            };
            return true;
        }
        catch (error) {
            console.error("❌ Token Verification Error:", error.message);
            response.status(401).json({
                statusCode: 401,
                message: `❌ Token Verification Error:", ${error.message}`,
                success: false
            });
            return false;
        }
    }
};
exports.JwtAuthGuard = JwtAuthGuard;
exports.JwtAuthGuard = JwtAuthGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [jwt_1.JwtService])
], JwtAuthGuard);
//# sourceMappingURL=jwt-auth.guard.js.map