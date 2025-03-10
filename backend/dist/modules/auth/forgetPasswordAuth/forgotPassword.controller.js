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
exports.ForgetPasswordController = void 0;
const common_1 = require("@nestjs/common");
const forgetPassword_service_1 = require("./forgetPassword.service");
const forgetPassword_dto_1 = require("./dto/forgetPassword.dto");
let ForgetPasswordController = class ForgetPasswordController {
    forgetPasswordService;
    constructor(forgetPasswordService) {
        this.forgetPasswordService = forgetPasswordService;
    }
    async sendOtpEmail(email) {
        console.log("📩 Sending OTP for forget password (email):", email);
        return this.forgetPasswordService.sendOtpEmail(email);
    }
    async sendOtpMobile(mobile) {
        return this.forgetPasswordService.sendOtpMobile(mobile);
    }
    async verifyOtpEmail(email, otp) {
        return this.forgetPasswordService.verifyOtpEmail(email, otp);
    }
    async verifyOtpMobile(mobile, otp) {
        return this.forgetPasswordService.verifyOtpMobile(mobile, otp);
    }
    async resetPassword(forgetPasswordUserData) {
        console.log("🔍 Received Forget Password request:", forgetPasswordUserData);
        const { email, mobile } = forgetPasswordUserData;
        console.log("🔎 Processing reset for:", email || mobile);
        if (email) {
            const isVerified = await this.forgetPasswordService.isEmailVerified(email);
            if (!isVerified) {
                throw new common_1.UnauthorizedException('Email OTP is not verified. Please verify OTP.');
            }
            const response = await this.forgetPasswordService.resetPassword(forgetPasswordUserData);
            await this.forgetPasswordService.clearVerifiedEmail(email);
            return response;
        }
        if (mobile) {
            const isVerified = await this.forgetPasswordService.isMobileVerified(mobile);
            if (!isVerified) {
                throw new common_1.UnauthorizedException('Mobile OTP is not verified. Please verify OTP.');
            }
            const response = await this.forgetPasswordService.resetPassword(forgetPasswordUserData);
            await this.forgetPasswordService.clearVerifiedMobile(mobile);
            return response;
        }
        throw new common_1.UnauthorizedException('Either email or mobile is required for password reset.');
    }
};
exports.ForgetPasswordController = ForgetPasswordController;
__decorate([
    (0, common_1.Post)('ForgetPassword/verify-email'),
    __param(0, (0, common_1.Body)('email')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ForgetPasswordController.prototype, "sendOtpEmail", null);
__decorate([
    (0, common_1.Post)('ForgetPassword/verify-mobile'),
    __param(0, (0, common_1.Body)('mobile')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ForgetPasswordController.prototype, "sendOtpMobile", null);
__decorate([
    (0, common_1.Post)('ForgetPassword/verify-otp-email'),
    __param(0, (0, common_1.Body)('email')),
    __param(1, (0, common_1.Body)('otp')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ForgetPasswordController.prototype, "verifyOtpEmail", null);
__decorate([
    (0, common_1.Post)('ForgetPassword/verify-otp-mobile'),
    __param(0, (0, common_1.Body)('mobile')),
    __param(1, (0, common_1.Body)('otp')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ForgetPasswordController.prototype, "verifyOtpMobile", null);
__decorate([
    (0, common_1.Post)('ForgetPassword/update'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [forgetPassword_dto_1.ForgetPasswordUserDto]),
    __metadata("design:returntype", Promise)
], ForgetPasswordController.prototype, "resetPassword", null);
exports.ForgetPasswordController = ForgetPasswordController = __decorate([
    (0, common_1.Controller)('auth'),
    __metadata("design:paramtypes", [forgetPassword_service_1.ForgetPasswordService])
], ForgetPasswordController);
//# sourceMappingURL=forgotPassword.controller.js.map