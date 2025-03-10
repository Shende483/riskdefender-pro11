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
exports.RegisterController = void 0;
const common_1 = require("@nestjs/common");
const common_2 = require("@nestjs/common");
const register_service_1 = require("./register.service");
const register_dto_1 = require("./dto/register.dto");
let RegisterController = class RegisterController {
    RegisterService;
    constructor(RegisterService) {
        this.RegisterService = RegisterService;
    }
    async sendOtpEmail(email) {
        return this.RegisterService.sendOtpEmail(email);
    }
    async sendOtpMobile(mobileNo) {
        console.log("mofbb", mobileNo);
        return this.RegisterService.sendOtpMobile(mobileNo);
    }
    async verifyOtpEmail(email, otp) {
        return this.RegisterService.verifyOtpEmail(email, otp);
    }
    async verifyOtpMobile(mobile, otp) {
        return this.RegisterService.verifyOtpMobile(mobile, otp);
    }
    async createUser(createUserDto) {
        const { email, mobile } = createUserDto;
        if (!(await this.RegisterService.isEmailVerified(email))) {
            throw new common_1.UnauthorizedException('Email is not verified. Please verify OTP.');
        }
        if (!(await this.RegisterService.isMobileVerified(mobile))) {
            throw new common_1.UnauthorizedException('Mobile number is not verified. Please verify OTP.');
        }
        const response = await this.RegisterService.createUser(createUserDto);
        await this.RegisterService.clearVerifiedEmail(email);
        await this.RegisterService.clearVerifiedMobile(mobile);
        return response;
    }
};
exports.RegisterController = RegisterController;
__decorate([
    (0, common_2.Post)('register/verify-email'),
    __param(0, (0, common_2.Body)('email')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], RegisterController.prototype, "sendOtpEmail", null);
__decorate([
    (0, common_2.Post)('register/verify-mobile'),
    __param(0, (0, common_2.Body)('mobile')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], RegisterController.prototype, "sendOtpMobile", null);
__decorate([
    (0, common_2.Post)('register/verify-otp-email'),
    __param(0, (0, common_2.Body)('email')),
    __param(1, (0, common_2.Body)('otp')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], RegisterController.prototype, "verifyOtpEmail", null);
__decorate([
    (0, common_2.Post)('register/verify-otp-mobile'),
    __param(0, (0, common_2.Body)('mobile')),
    __param(1, (0, common_2.Body)('otp')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], RegisterController.prototype, "verifyOtpMobile", null);
__decorate([
    (0, common_2.Post)('register'),
    __param(0, (0, common_2.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [register_dto_1.CreateUserDto]),
    __metadata("design:returntype", Promise)
], RegisterController.prototype, "createUser", null);
exports.RegisterController = RegisterController = __decorate([
    (0, common_2.Controller)('auth'),
    __metadata("design:paramtypes", [register_service_1.RegisterService])
], RegisterController);
//# sourceMappingURL=register.controller.js.map