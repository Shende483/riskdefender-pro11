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
exports.OtpService = void 0;
const common_1 = require("@nestjs/common");
const nodemailer = require("nodemailer");
const ioredis_1 = require("ioredis");
let OtpService = class OtpService {
    redisClient;
    constructor(redisClient) {
        this.redisClient = redisClient;
    }
    async sendOtp(email, context) {
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresIn = 15 * 60;
        await this.redisClient.set(`otp:${email}`, otp, 'EX', expiresIn);
        console.log(`📩 Generating OTP for ${context}: ${email}`);
        console.log(`🔢 OTP: ${otp} (Valid for 15 min)`);
        const storedOtp = await this.redisClient.get(`otp:${email}`);
        console.log(`🛢️ OTP stored in Redis: ${storedOtp}`);
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });
        try {
            await transporter.sendMail({
                from: process.env.EMAIL_USER,
                to: email,
                subject: `OTP for ${context}`,
                text: `Dear user, your OTP is ${otp}. It is valid for 15 minutes.`,
            });
            console.log(`✅ OTP sent successfully to ${email}`);
        }
        catch (error) {
            console.error(`❌ Failed to send OTP to ${email}:`, error);
            throw new common_1.UnauthorizedException('Failed to send OTP. Please try again.');
        }
        return { message: `OTP sent successfully to ${email}` };
    }
    async verifyOtp(email, enteredOtp) {
        console.log(`🔍 Verifying OTP for ${email}`);
        const storedOtp = await this.redisClient.get(`otp:${email}`);
        console.log(`📤 Retrieved OTP from Redis: ${storedOtp}`);
        if (!storedOtp) {
            console.warn(`⚠️ OTP expired or not found for ${email}`);
            throw new common_1.UnauthorizedException('OTP expired or invalid');
        }
        if (storedOtp !== enteredOtp) {
            console.error(`❌ Invalid OTP entered for ${email}`);
            throw new common_1.UnauthorizedException('Invalid OTP');
        }
        await this.redisClient.del(`otp:${email}`);
        console.log(`🗑️ OTP deleted from Redis for: ${email}`);
        await this.setVerifiedEmail(email);
        return { message: 'OTP verified successfully' };
    }
    async setVerifiedEmail(email) {
        await this.redisClient.set(`verified:${email}`, 'true');
        console.log(`📌 Email marked as verified: ${email}`);
        const verifiedStatus = await this.redisClient.get(`verified:${email}`);
        console.log(`🛢️ Verified email stored in Redis: ${verifiedStatus}`);
    }
    async isEmailVerified(email) {
        const exists = await this.redisClient.get(`verified:${email}`);
        console.log(`🔎 Checking verified status in Redis: ${exists}`);
        return exists === 'true';
    }
    async clearVerifiedEmail(email) {
        await this.redisClient.del(`verified:${email}`);
        console.log(`🗑️ Verification status deleted from Redis for: ${email}`);
    }
};
exports.OtpService = OtpService;
exports.OtpService = OtpService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)('REDIS_CLIENT')),
    __metadata("design:paramtypes", [ioredis_1.default])
], OtpService);
//# sourceMappingURL=otp.service.js.map