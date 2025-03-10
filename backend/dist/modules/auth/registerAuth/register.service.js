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
exports.RegisterService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const register_schema_1 = require("./register.schema");
const otp_service_1 = require("../../../common/otp.service");
const bcrypt_service_1 = require("../../../common/bcrypt.service");
let RegisterService = class RegisterService {
    userModel;
    otpService;
    constructor(userModel, otpService) {
        this.userModel = userModel;
        this.otpService = otpService;
    }
    async sendOtpEmail(email) {
        console.log(`📩 Sending OTP for email: ${email}`);
        const user = await this.findUserByEmail(email);
        if (user) {
            throw new common_1.UnauthorizedException('Email already registered');
        }
        return this.otpService.sendOtpEmail(email, 'register');
    }
    async sendOtpMobile(mobile) {
        console.log(`📩 Sending OTP for mobile: ${mobile}`);
        const user = await this.findUserByMobile(mobile);
        if (user) {
            throw new common_1.UnauthorizedException('Mobile number already registered');
        }
        return this.otpService.sendOtpMobile(mobile, 'register');
    }
    async verifyOtpEmail(email, otp) {
        console.log(`🔍 Verifying OTP for email: ${email}`);
        const result = await this.otpService.verifyOtpEmail(email, otp);
        console.log(`✅ Email verified: ${email}`);
        await this.otpService.setVerifiedEmail(email);
        return result;
    }
    async verifyOtpMobile(mobile, otp) {
        console.log(`🔍 Verifying OTP for mobile: ${mobile}`);
        const result = await this.otpService.verifyOtpMobile(mobile, otp);
        console.log(`✅ Mobile verified: ${mobile}`);
        await this.otpService.setVerifiedMobile(mobile);
        return result;
    }
    async createUser(createUserDto) {
        const { email, mobile, password } = createUserDto;
        if (!(await this.otpService.isEmailVerified(email))) {
            throw new common_1.UnauthorizedException('Email OTP is not verified');
        }
        if (!(await this.otpService.isMobileVerified(mobile))) {
            throw new common_1.UnauthorizedException('Mobile OTP is not verified');
        }
        createUserDto.password = await bcrypt_service_1.bcryptService.hashData(password);
        try {
            const newUser = new this.userModel(createUserDto);
            const savedUser = await newUser.save();
            console.log('✅ User registered successfully:', savedUser);
            return savedUser;
        }
        catch (error) {
            console.error('❌ Error saving user:', error);
            throw new Error('Failed to save user');
        }
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
    async findUserByEmailOrMobile(emailOrMobile) {
        return this.userModel
            .findOne({
            $or: [{ email: emailOrMobile }, { mobile: emailOrMobile }],
        })
            .exec();
    }
    async findUserByEmail(email) {
        return this.userModel.findOne({ email }).exec();
    }
    async findUserByMobile(mobile) {
        return this.userModel.findOne({ mobile }).exec();
    }
    async updateUserPassword(userId, newPassword) {
        return this.userModel.findByIdAndUpdate(userId, { password: newPassword }, { new: true, runValidators: true }).exec();
    }
};
exports.RegisterService = RegisterService;
exports.RegisterService = RegisterService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(register_schema_1.User.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        otp_service_1.OtpService])
], RegisterService);
//# sourceMappingURL=register.service.js.map