import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User } from './register.schema';
import { CreateUserDto } from './dto/register.dto';
import { OtpService } from '../../../common/otp.service';
import { bcryptService } from 'src/common/bcrypt.service';
import { Response } from 'express';
import { AlertManagement, AlertManagementDocument } from 'src/modules/sidebar-management/alert-management/alert-management.schema';
import { TradingJournalManagement, TradingJournalManagementDocument } from 'src/modules/sidebar-management/trading-journal-management/trading-journal-management.schema';


@Injectable()
export class RegisterService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(AlertManagement.name) private alertPaymentModel: Model<AlertManagementDocument>,
    @InjectModel(TradingJournalManagement.name) private tradingJournalPaymentModel: Model<TradingJournalManagementDocument>,
    private otpService: OtpService,
  ) {}

  // 🔹 Send OTP for Email
  async sendOtpEmail(email: string, res: Response) {
    console.log(`📩 Sending OTP to email: ${email}`);
  
    const user = await this.findUserByEmail(email);
    if (user) {
      return res.status(200).json({
        statusCode: 400,
        message: 'User already registered.',
        success: false,
      });
    }
  
    const response = await this.otpService.sendOtpEmail(email, 'register');
    return res.status(200).json({
      statusCode: 200,
      message: response.message,
      success: response.success,
    });
  }

  // 🔹 Send OTP for Mobile
  async sendOtpMobile(mobile: string, res: Response) {
    console.log(`📩 Sending OTP to mobile: ${mobile}`);
  
    const user = await this.findUserByMobile(mobile);
    if (user) {
      return res.status(200).json({
        statusCode: 400,
        message: 'User already registered.',
        data: "fghjfdghjhgjkgfjkgjkfhgjhfhghfhg",
        success: false,
      });
    }
  
    const response = await this.otpService.sendOtpMobile(mobile, 'register');
    return res.status(200).json({
      statusCode: 200,
      message: response.message,
      success: response.success,
    });
  }

  // 🔹 Verify OTP for Email
  async verifyOtpEmail(email: string, otp: string, res: Response) {
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

  // 🔹 Verify OTP for Mobile
  async verifyOtpMobile(mobile: string, otp: string, res: Response) {
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

  async createUser(createUserDto: CreateUserDto, res: Response): Promise<User | void> {
    const { email, mobile, password } = createUserDto;
  
    const emailVerified = await this.otpService.isEmailVerified(email);
    const mobileVerified = await this.otpService.isMobileVerified(mobile);
  
    if (!emailVerified) {
      res.status(200).json({
        statusCode: 400,
        message: '❌ Email is not verified. Please verify OTP.',
        success: false,
      });
      return;
    }
  
    if (!mobileVerified) {
      res.status(200).json({
        statusCode: 400,
        message: '❌ Mobile number is not verified. Please verify OTP.',
        success: false,
      });
      return;
    }
  
    createUserDto.password = await bcryptService.hashData(password);
  
    try {
      const newUser = new this.userModel(createUserDto);
      const savedUser = await newUser.save();
      console.log('✅ User registered successfully:', savedUser);

      // Create AlertPayment document
      await this.alertPaymentModel.create({
        userId: savedUser._id,
        myAlertLimit: 0,
       
      });

      // Create TradingJournalPayment document
      await this.tradingJournalPaymentModel.create({
        userId: savedUser._id,
        myTradingJournalLimit: 0,
       
      });

      res.status(201).json({
        statusCode: 201,
        message: '✅ User registered successfully',
        success: true,
        data: savedUser,
      });
    } catch (error) {
      console.error('❌ Error saving user or payment data:', error);
      res.status(200).json({
        statusCode: 500,
        message: '❌ Something went wrong. User not saved.',
        success: false,
      });
    }
  }

  // 🔹 Check if Email is Verified
  async isEmailVerified(email: string): Promise<boolean> {
    return this.otpService.isEmailVerified(email);
  }

  // 🔹 Check if Mobile is Verified
  async isMobileVerified(mobile: string): Promise<boolean> {
    return this.otpService.isMobileVerified(mobile);
  }

  // 🔹 Clear Verification Status (Email)
  async clearVerifiedEmail(email: string): Promise<void> {
    await this.otpService.clearVerifiedEmail(email);
  }

  // 🔹 Clear Verification Status (Mobile)
  async clearVerifiedMobile(mobile: string): Promise<void> {
    await this.otpService.clearVerifiedMobile(mobile);
  }

  // 🔹 Find User by Email or Mobile
  async findUserByEmailOrMobile(emailOrMobile: string): Promise<User | null> {
    return this.userModel
      .findOne({
        $or: [{ email: emailOrMobile }, { mobile: emailOrMobile }],
      })
      .exec();
  }

  async findUserByEmail(email: string): Promise<User | null> {
    return this.userModel.findOne({ email }).exec();
  }

  // 🔹 Find User by Mobile
  async findUserByMobile(mobile: string): Promise<User | null> {
    return this.userModel.findOne({ mobile }).exec();
  }

  async updateUserPassword(userId: string, newPassword: string): Promise<User | null> {
    return this.userModel.findByIdAndUpdate(
      userId, 
      { password: newPassword }, 
      { new: true, runValidators: true }
    ).exec();
  }
}