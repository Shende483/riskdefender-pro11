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
let LoginService = class LoginService {
    usersService;
    jwtService;
    otpService;
    constructor(usersService, jwtService, otpService) {
        this.usersService = usersService;
        this.jwtService = jwtService;
        this.otpService = otpService;
    }
    async sendOtp(email) {
        console.log(`📩 Sending OTP for login: ${email}`);
        const user = await this.usersService.findUserByEmail(email);
        if (!user) {
            throw new common_1.UnauthorizedException('User not found');
        }
        return this.otpService.sendOtp(email, 'login');
    }
    async verifyOtp(email, otp) {
        console.log(`🔍 Verifying OTP for: ${email}`);
        const result = await this.otpService.verifyOtp(email, otp);
        console.log(`✅ Storing verification status for: ${email}`);
        await this.otpService.setVerifiedEmail(email);
        return result;
    }
    async login(loginUserDto) {
        const { email, password } = loginUserDto;
        console.log(`🔐 Attempting login for: ${email}`);
        const user = await this.usersService.findUserByEmail(email);
        if (!user) {
            throw new common_1.UnauthorizedException('User not found');
        }
        if (user.password !== password) {
            throw new common_1.UnauthorizedException('Invalid password');
        }
        return {
            message: 'Login successful',
            access_token: this.jwtService.sign({ email, userId: user._id }),
        };
    }
    async isEmailVerified(email) {
        return this.otpService.isEmailVerified(email);
    }
    async clearVerifiedEmail(email) {
        await this.otpService.clearVerifiedEmail(email);
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