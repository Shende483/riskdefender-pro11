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
    async sendOtpEmail(email, res) {
        console.log(`📩 Sending OTP  email: ${email}`);
        const user = await this.findUserByEmail(email);
        if (user) {
            res.status(400).json({
                statusCode: 400,
                message: 'User Already registered',
                data: "fghjfdghjhgjkgfjkgjkfhgjhfhghfhg",
                success: true,
            });
            return;
        }
        const response = await this.otpService.sendOtpEmail(email, 'register');
        res.status(400).json({
            statusCode: response.statuscode,
            message: response.message,
            success: response.success,
        });
    }
    async sendOtpMobile(mobile, res) {
        console.log(`📩 Sending OTP for mobile: ${mobile}`);
        const user = await this.findUserByMobile(mobile);
        if (user) {
            res.status(400).json({
                statusCode: 400,
                message: 'User Already registered',
                data: "fghjfdghjhgjkgfjkgjkfhgjhfhghfhg",
                success: false,
            });
        }
        const response = await this.otpService.sendOtpMobile(mobile, 'register');
        res.status(400).json({
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
        console.log(`✅ Email verified: ${email}`);
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
        console.log(`✅ Mobile verified: ${mobile}`);
        await this.otpService.setVerifiedMobile(mobile);
    }
    async createUser(createUserDto, res) {
        const { email, mobile, password } = createUserDto;
        const emailVerified = await this.otpService.isEmailVerified(email);
        const mobileVerified = await this.otpService.isMobileVerified(mobile);
        if (!emailVerified) {
            res.status(400).json({
                statusCode: 400,
                message: '❌ Email is not verified. Please verify OTP.',
                success: false,
            });
        }
        if (!mobileVerified) {
            res.status(400).json({
                statusCode: 400,
                message: '❌ Mobile number is not verified. Please verify OTP.',
                success: false,
            });
        }
        createUserDto.password = await bcrypt_service_1.bcryptService.hashData(password);
        try {
            const newUser = new this.userModel(createUserDto);
            const savedUser = await newUser.save();
            console.log('✅ User registered successfully:', savedUser);
            res.status(201).json({
                statusCode: 201,
                message: '✅ User registered successfully',
                success: true,
                data: savedUser,
            });
        }
        catch (error) {
            console.error('❌ Error saving user:', error);
            res.status(500).json({
                statusCode: 500,
                message: '❌ Something went wrong. User not saved.',
                success: false,
            });
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