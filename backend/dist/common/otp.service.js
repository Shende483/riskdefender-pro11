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
const axios_1 = require("axios");
let OtpService = class OtpService {
    redisClient;
    constructor(redisClient) {
        this.redisClient = redisClient;
    }
    async generateOtp() {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }
    async storeOtp(key, otp, expiresIn) {
        await this.redisClient.set(key, otp, 'EX', expiresIn);
        console.log(`🛢️ OTP stored in Redis for ${key}: ${otp}`);
    }
    async verifyStoredOtp(key, enteredOtp) {
        const storedOtp = await this.redisClient.get(key);
        console.log(`📤 Retrieved OTP from Redis for ${key}: ${storedOtp}`);
        if (!storedOtp) {
            console.warn(`⚠️ OTP expired or not found for ${key}`);
            throw new common_1.UnauthorizedException('OTP expired or invalid');
        }
        if (storedOtp !== enteredOtp) {
            console.error(`❌ Invalid OTP entered for ${key}`);
            throw new common_1.UnauthorizedException('Invalid OTP');
        }
        await this.redisClient.del(key);
        console.log(`🗑️ OTP deleted from Redis for: ${key}`);
    }
    async setVerified(key) {
        await this.redisClient.set(key, 'true');
        console.log(`📌 ${key} marked as verified.`);
    }
    async setVerifiedEmail(email) {
        await this.redisClient.set(`verified:${email}`, 'true');
        console.log(`📌 Email marked as verified: ${email}`);
    }
    async isVerified(key) {
        const exists = await this.redisClient.get(key);
        console.log(`🔎 Checking verified status in Redis: ${exists}`);
        return exists === 'true';
    }
    async clearVerified(key) {
        await this.redisClient.del(key);
        console.log(`🗑️ Verification status deleted from Redis for: ${key}`);
    }
    async sendOtpEmail(email, context) {
        const otp = await this.generateOtp();
        const expiresIn = 15 * 60;
        await this.storeOtp(`otp:${email}`, otp, expiresIn);
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
            return { message: `✅ OTP sent successfully to ${email}`, statuscode: 201, success: true };
        }
        catch (error) {
            console.error(`❌ Failed to send OTP to ${email}:`, error);
            return { message: `❌ Failed to send OTP,Incorrect eamil:${email}:`, error, statuscode: 400, success: false };
        }
    }
    async verifyOtpEmail(email, enteredOtp) {
        try {
            await this.verifyStoredOtp(`otp:${email}`, enteredOtp);
            await this.setVerified(`verified:${email}`);
            return { message: `OTP verified successfully for ${email}`, statuscode: 201, success: true };
        }
        catch (error) {
            console.error(`❌ Error during OTP verification for ${email}:`, error);
            return { message: '❌ Invalid OTP ', statuscode: 500, success: false };
        }
    }
    async isEmailVerified(email) {
        return this.isVerified(`verified:${email}`);
    }
    async clearVerifiedEmail(email) {
        await this.clearVerified(`verified:${email}`);
    }
    async sendOtpMobile(mobile, context) {
        const dummyOtp = '999999';
        const useDummyOtp = true;
        const otp = useDummyOtp ? dummyOtp : await this.generateOtp();
        const expiresIn = 15 * 60;
        await this.storeOtp(`otp:${mobile}`, otp, expiresIn);
        if (!useDummyOtp) {
            try {
                await axios_1.default.get('https://www.fast2sms.com/dev/bulkV2', {
                    params: {
                        authorization: process.env.FAST2SMS_API_KEY,
                        variables_values: otp,
                        route: 'otp',
                        numbers: mobile,
                    },
                    headers: {
                        'cache-control': 'no-cache',
                    },
                });
                return { message: `✅ OTP sent successfully to ${mobile}`, statuscode: 201, success: true };
                console.log(`✅ Mobile OTP sent to ${mobile}`);
            }
            catch (error) {
                console.error(`❌ Failed to send Mobile OTP:`, error);
                return { message: `❌ Failed to send OTP to ${mobile}:`, error, statuscode: 400, success: false };
            }
        }
        else {
            console.log(`📲 Using Dummy OTP for mobile verification: ${dummyOtp}`);
            return { message: `✅ OTP sent successfully to ${mobile} ,dummy otp is 999999`, statuscode: 201, success: true };
        }
    }
    async verifyOtpMobile(mobile, enteredOtp) {
        try {
            await this.verifyStoredOtp(`otp:${mobile}`, enteredOtp);
            await this.setVerified(`verified:${mobile}`);
            return { message: `OTP verified successfully for ${mobile}`, statuscode: 201, success: true };
        }
        catch (error) {
            console.error(`❌ Error during OTP verification for ${mobile}:`, error);
            return { message: '❌ Invalid OTP ', statuscode: 500, success: false };
        }
    }
    async setVerifiedMobile(mobile) {
        await this.redisClient.set(`verified:${mobile}`, 'true');
        console.log(`📌 Mobile marked as verified: ${mobile}`);
    }
    async isMobileVerified(mobile) {
        return this.isVerified(`verified:${mobile}`);
    }
    async clearVerifiedMobile(mobile) {
        await this.clearVerified(`verified:${mobile}`);
    }
};
exports.OtpService = OtpService;
exports.OtpService = OtpService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)('REDIS_CLIENT')),
    __metadata("design:paramtypes", [ioredis_1.default])
], OtpService);
//# sourceMappingURL=otp.service.js.map