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
    async sendOtpEmail(email, res) {
        console.log(`📩 Sending OTP for login (email): ${email}`);
        const user = await this.usersService.findUserByEmail(email);
        if (!user) {
            res.status(400).json({
                statusCode: 400,
                message: 'User not found',
                success: false,
            });
            return;
        }
        const response = await this.otpService.sendOtpEmail(email, 'login');
        res.status(200).json({
            statusCode: response.statuscode,
            message: response.message,
            success: response.success,
        });
    }
    async sendOtpMobile(mobile, res) {
        console.log(`📩 Sending OTP for login (mobile): ${mobile}`);
        const user = await this.usersService.findUserByMobile(mobile);
        if (!user) {
            res.status(400).json({
                statusCode: 400,
                message: 'User not found',
                success: false,
            });
            return;
        }
        const response = await this.otpService.sendOtpMobile(mobile, 'login');
        res.status(200).json({
            statusCode: response.statuscode,
            message: response.message,
            success: response.success,
        });
    }
    async verifyOtpEmail(email, otp, res) {
        console.log(`🔍 Verifying OTP for email: ${email}`);
        const response = await this.otpService.verifyOtpEmail(email, otp);
        res.status(200).json({
            statusCode: response.statuscode,
            message: response.message,
            success: response.success,
        });
        console.log(`✅ Storing verification status for email: ${email}`);
        await this.otpService.setVerifiedEmail(email);
    }
    async verifyOtpMobile(mobile, otp, res) {
        console.log(`🔍 Verifying OTP for mobile: ${mobile}`);
        const response = await this.otpService.verifyOtpMobile(mobile, otp);
        res.status(200).json({
            statusCode: response.statuscode,
            message: response.message,
            success: response.success,
        });
        console.log(`✅ Storing verification status for mobile: ${mobile}`);
        await this.otpService.setVerifiedMobile(mobile);
    }
    async login(loginUserDto, res) {
        const { email, mobile, password } = loginUserDto;
        console.log(`🔐 Attempting login for:`, { email, mobile });
        let user;
        if (email) {
            user = await this.usersService.findUserByEmail(email);
            if (!user) {
                res.status(400).json({
                    statusCode: 400,
                    message: 'User not found',
                    success: false,
                });
                return;
            }
            const isMatch = await bcrypt_service_1.bcryptService.compareData(String(password), user.password);
            if (!isMatch) {
                res.status(400).json({
                    statusCode: 400,
                    message: 'Invalid password',
                    success: false,
                });
                return;
            }
            await this.otpService.clearVerifiedEmail(email);
        }
        else if (mobile) {
            user = await this.usersService.findUserByMobile(mobile);
            if (!user) {
                res.status(400).json({
                    statusCode: 400,
                    message: 'User not found',
                    success: false,
                });
                return;
            }
            const isMatch = await bcrypt_service_1.bcryptService.compareData(String(password), user.password);
            if (!isMatch) {
                res.status(400).json({
                    statusCode: 400,
                    message: 'Invalid password',
                    success: false,
                });
                return;
            }
            await this.otpService.clearVerifiedMobile(mobile);
        }
        else {
            res.status(400).json({
                statusCode: 400,
                message: 'Either email or mobile is required for login.',
                success: false,
            });
            return;
        }
        const accessToken = await this.jwtService.signAsync({
            id: user._id,
        });
        console.log("grgrt", accessToken);
        res.status(200).json({
            statusCode: 200,
            message: 'Login successful',
            success: true,
            access_token: accessToken
        });
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