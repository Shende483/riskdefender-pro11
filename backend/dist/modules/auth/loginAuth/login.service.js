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
exports.LoginService = void 0;
const common_1 = require("@nestjs/common");
const register_service_1 = require("../registerAuth/register.service");
const jwt_1 = require("@nestjs/jwt");
const otp_service_1 = require("../../../common/otp.service");
const bcrypt_service_1 = require("../../../common/bcrypt.service");
let LoginService = class LoginService {
    usersService;
    jwtService;
    otpService;
    constructor(usersService, jwtService, otpService) {
        this.usersService = usersService;
        this.jwtService = jwtService;
        this.otpService = otpService;
    }
    async sendOtpEmail(email) {
        console.log(`📩 Sending OTP for login (email): ${email}`);
        const user = await this.usersService.findUserByEmail(email);
        if (!user) {
            throw new common_1.UnauthorizedException('User not found');
        }
        return this.otpService.sendOtpEmail(email, 'login');
    }
    async sendOtpMobile(mobile) {
        console.log(`📩 Sending OTP for login (mobile): ${mobile}`);
        const user = await this.usersService.findUserByMobile(mobile);
        if (!user) {
            throw new common_1.UnauthorizedException('User not found');
        }
        return this.otpService.sendOtpMobile(mobile, 'login');
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
    async login(loginUserDto) {
        const { email, mobile, password } = loginUserDto;
        console.log(`🔐 Attempting login for:`, { email, mobile });
        let user;
        if (email) {
            user = await this.usersService.findUserByEmail(email);
            if (!user)
                throw new common_1.UnauthorizedException('User not found');
            const isMatch = await bcrypt_service_1.bcryptService.compareData(String(password), user.password);
            if (!isMatch)
                throw new common_1.UnauthorizedException('Invalid password');
            await this.otpService.clearVerifiedEmail(email);
        }
        else if (mobile) {
            user = await this.usersService.findUserByMobile(mobile);
            if (!user)
                throw new common_1.UnauthorizedException('User not found');
            const isMatch = await bcrypt_service_1.bcryptService.compareData(String(password), user.password);
            if (!isMatch)
                throw new common_1.UnauthorizedException('Invalid password');
            await this.otpService.clearVerifiedMobile(mobile);
        }
        else {
            throw new common_1.UnauthorizedException('Either email or mobile is required for login.');
        }
        return {
            message: 'Login successful',
            access_token: this.jwtService.sign({ userId: user._id, email: user.email, mobile: user.mobile }),
        };
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
exports.LoginService = LoginService;
exports.LoginService = LoginService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [register_service_1.RegisterService,
        jwt_1.JwtService,
        otp_service_1.OtpService])
], LoginService);
//# sourceMappingURL=login.service.js.map