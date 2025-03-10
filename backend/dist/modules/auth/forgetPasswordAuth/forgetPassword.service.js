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
exports.ForgetPasswordService = void 0;
const common_1 = require("@nestjs/common");
const register_service_1 = require("../registerAuth/register.service");
const otp_service_1 = require("../../../common/otp.service");
const bcrypt_service_1 = require("../../../common/bcrypt.service");
let ForgetPasswordService = class ForgetPasswordService {
    usersService;
    otpService;
    constructor(usersService, otpService) {
        this.usersService = usersService;
        this.otpService = otpService;
    }
    async sendOtpEmail(email) {
        console.log(`📩 Sending OTP for forget password (email): ${email}`);
        const user = await this.usersService.findUserByEmail(email);
        if (!user) {
            throw new common_1.UnauthorizedException('User not found');
        }
        return this.otpService.sendOtpEmail(email, 'forget-password');
    }
    async sendOtpMobile(mobile) {
        console.log(`📩 Sending OTP for forget password (mobile): ${mobile}`);
        const user = await this.usersService.findUserByMobile(mobile);
        if (!user) {
            throw new common_1.UnauthorizedException('User not found');
        }
        return this.otpService.sendOtpMobile(mobile, 'forget-password');
    }
    async verifyOtpEmail(email, otp) {
        console.log(`🔍 Verifying OTP for email: ${email}`);
        const result = await this.otpService.verifyOtpEmail(email, otp);
        console.log(`✅ Storing verification status for email: ${email}`);
        await this.otpService.setVerifiedEmail(email);
        return result;
    }
    async verifyOtpMobile(mobile, otp) {
        console.log(`🔍 Verifying OTP for mobile: ${mobile}`);
        const result = await this.otpService.verifyOtpMobile(mobile, otp);
        console.log(`✅ Storing verification status for mobile: ${mobile}`);
        await this.otpService.setVerifiedMobile(mobile);
        return result;
    }
    async resetPassword(forgetPasswordUserDto) {
        const { email, mobile, password } = forgetPasswordUserDto;
        console.log(`🔐 Attempting password reset for:`, { email, mobile });
        let user;
        if (email) {
            user = await this.usersService.findUserByEmail(email);
            if (!user)
                throw new common_1.UnauthorizedException('User not found');
            if (!await this.isEmailVerified(email)) {
                throw new common_1.UnauthorizedException('Email OTP is not verified.');
            }
            const newPassword = await bcrypt_service_1.bcryptService.hashData(String(password));
            await this.usersService.updateUserPassword(user._id, newPassword);
            await this.otpService.clearVerifiedEmail(email);
        }
        else if (mobile) {
            user = await this.usersService.findUserByMobile(mobile);
            if (!user)
                throw new common_1.UnauthorizedException('User not found');
            if (!await this.isMobileVerified(mobile)) {
                throw new common_1.UnauthorizedException('Mobile OTP is not verified.');
            }
            const newPassword = await bcrypt_service_1.bcryptService.hashData(String(password));
            await this.usersService.updateUserPassword(user._id, newPassword);
            await this.otpService.clearVerifiedMobile(mobile);
        }
        else {
            throw new common_1.UnauthorizedException('Either email or mobile is required for password reset.');
        }
        return { message: 'Password reset successful' };
    }
    async isEmailVerified(email) {
        return this.otpService.isEmailVerified(email);
    }
    async isMobileVerified(mobile) {
        return this.otpService.isMobileVerified(mobile);
    }
    async clearVerifiedEmail(email) {
        await this.otpService.clearVerifiedEmail(email);
    }
    async clearVerifiedMobile(mobile) {
        await this.otpService.clearVerifiedMobile(mobile);
    }
};
exports.ForgetPasswordService = ForgetPasswordService;
exports.ForgetPasswordService = ForgetPasswordService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [register_service_1.RegisterService,
        otp_service_1.OtpService])
], ForgetPasswordService);
//# sourceMappingURL=forgetPassword.service.js.map