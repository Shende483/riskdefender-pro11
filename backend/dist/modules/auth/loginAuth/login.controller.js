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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoginController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const login_service_1 = require("./login.service");
const login_dto_1 = require("./dto/login.dto");
let LoginController = class LoginController {
    loginService;
    constructor(loginService) {
        this.loginService = loginService;
    }
    async sendOtpEmail(email) {
        console.log("enndjd", email);
        return this.loginService.sendOtpEmail(email);
    }
    async sendOtpMobile(mobile) {
        return this.loginService.sendOtpMobile(mobile);
    }
    async verifyOtpEmail(email, otp) {
        return this.loginService.verifyOtpEmail(email, otp);
    }
    async verifyOtpMobile(mobile, otp) {
        return this.loginService.verifyOtpMobile(mobile, otp);
    }
    async login(loginUserDto) {
        console.log("🔍 Received login request:", loginUserDto);
        const { email, mobile } = loginUserDto;
        console.log("eenen", email, mobile);
        if (email) {
            const isVerified = await this.loginService.isEmailVerified(email);
            if (!isVerified) {
                throw new common_1.UnauthorizedException('Email OTP is not verified. Please verify OTP.');
            }
            const response = await this.loginService.login(loginUserDto);
            await this.loginService.clearVerifiedEmail(email);
            return response;
        }
        if (mobile) {
            const isVerified = await this.loginService.isMobileVerified(mobile);
            if (!isVerified) {
                throw new common_1.UnauthorizedException('Mobile OTP is not verified. Please verify OTP.');
            }
            const response = await this.loginService.login(loginUserDto);
            await this.loginService.clearVerifiedMobile(mobile);
            return response;
        }
        throw new common_1.UnauthorizedException('Either email or mobile is required for login.');
    }
};
exports.LoginController = LoginController;
__decorate([
    (0, common_1.Post)('login/verify-email'),
    (0, swagger_1.ApiOperation)({ summary: 'Send OTP for Email Verification' }),
    (0, swagger_1.ApiBody)({ schema: { properties: { email: { type: 'string', example: 'user@example.com' } } } }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'OTP sent successfully' }),
    __param(0, (0, common_1.Body)('email')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], LoginController.prototype, "sendOtpEmail", null);
__decorate([
    (0, common_1.Post)('login/verify-mobile'),
    (0, swagger_1.ApiOperation)({ summary: 'Send OTP for Mobile Verification' }),
    (0, swagger_1.ApiBody)({ schema: { properties: { mobile: { type: 'string', example: '9876543210' } } } }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'OTP sent successfully' }),
    __param(0, (0, common_1.Body)('mobile')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], LoginController.prototype, "sendOtpMobile", null);
__decorate([
    (0, common_1.Post)('login/verify-otp-email'),
    (0, swagger_1.ApiOperation)({ summary: 'Verify OTP for Email' }),
    (0, swagger_1.ApiBody)({ schema: { properties: { email: { type: 'string' }, otp: { type: 'string' } } } }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'OTP verified successfully' }),
    __param(0, (0, common_1.Body)('email')),
    __param(1, (0, common_1.Body)('otp')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], LoginController.prototype, "verifyOtpEmail", null);
__decorate([
    (0, common_1.Post)('login/verify-otp-mobile'),
    (0, swagger_1.ApiOperation)({ summary: 'Verify OTP for Mobile' }),
    (0, swagger_1.ApiBody)({ schema: { properties: { mobile: { type: 'string' }, otp: { type: 'string' } } } }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'OTP verified successfully' }),
    __param(0, (0, common_1.Body)('mobile')),
    __param(1, (0, common_1.Body)('otp')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], LoginController.prototype, "verifyOtpMobile", null);
__decorate([
    (0, common_1.Post)('login'),
    (0, swagger_1.ApiOperation)({ summary: 'Login User' }),
    (0, swagger_1.ApiBody)({ type: login_dto_1.LoginUserDto }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Login successful' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized - OTP not verified' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [login_dto_1.LoginUserDto]),
    __metadata("design:returntype", Promise)
], LoginController.prototype, "login", null);
exports.LoginController = LoginController = __decorate([
    (0, swagger_1.ApiTags)('Authentication'),
    (0, common_1.Controller)('auth'),
    __metadata("design:paramtypes", [login_service_1.LoginService])
], LoginController);
//# sourceMappingURL=login.controller.js.map