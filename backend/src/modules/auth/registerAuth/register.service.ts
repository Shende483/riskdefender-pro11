/*
// src/module/users/users.service.ts
import { Injectable,UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './register.schema';
import { CreateUserDto } from './dto/register.dto';
import { OtpService } from '../../../common/otp.service';

@Injectable()
export class RegisterService {
  constructor(@InjectModel(User.name) private userModel: Model<User>,
  private otpService: OtpService,
) {}

  async sendOtp(email: string) {
    console.log(`📩 Sending OTP for register: ${email}`);
    const user = await this.findUserByEmail(email);
    if (user) {
      throw new UnauthorizedException('User Already Registered');
    }
    return this.otpService.sendOtp(email, 'register');
  }

  async verifyOtp(email: string, otp: string) {
    console.log(`🔍 Verifying OTP for: ${email}`);
    const result = await this.otpService.verifyOtp(email, otp);

    // ✅ Store email verification status in Redis
    console.log(`✅ Storing verification status for: ${email}`);
    await this.otpService.setVerifiedEmail(email);
    return result;
  }


  async createUser(createUserDto: CreateUserDto): Promise<User> {
    try {
      const newUser = new this.userModel(createUserDto);
      const savedUser = await newUser.save();
      console.log("✅ User saved successfully:", savedUser);
      return savedUser;
    } catch (error) {
      console.error("❌ Error saving user:", error);
      throw new Error("Failed to save user");
    }
  }
  

  // ✅ Check if email is verified before login (uses Redis)
  async isEmailVerified(email: string): Promise<boolean> {
    return this.otpService.isEmailVerified(email);
  }

  // ✅ Clear verification status after login (uses Redis)
  async clearVerifiedEmail(email: string): Promise<void> {
    await this.otpService.clearVerifiedEmail(email);
  }

async findUserByEmailOrMobile(emailOrMobile: string): Promise<User | null> {
  return this.userModel.findOne({
    $or: [{ email: emailOrMobile }, { mobile: emailOrMobile }],
  }).exec();
}

  async findUserByEmail(email: string): Promise<User | null> {
    return this.userModel.findOne({ email }).exec();
  }
}

*/




import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './register.schema';
import { CreateUserDto } from './dto/register.dto';
import { OtpService } from '../../../common/otp.service';
import { bcryptService } from 'src/common/bcrypt.service';

@Injectable()
export class RegisterService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private otpService: OtpService,
  ) {}

  // 🔹 Send OTP for Email
  async sendOtpEmail(email: string) {
    console.log(`📩 Sending OTP for email: ${email}`);
    const user = await this.findUserByEmail(email);
    if (user) {
      throw new UnauthorizedException('Email already registered');
    }
    return this.otpService.sendOtpEmail(email, 'register');
  }

  // 🔹 Send OTP for Mobile
  async sendOtpMobile(mobile: string) {
    console.log(`📩 Sending OTP for mobile: ${mobile}`);
    const user = await this.findUserByMobile(mobile);
    if (user) {
      throw new UnauthorizedException('Mobile number already registered');
    }
    return this.otpService.sendOtpMobile(mobile, 'register');
  }

  // 🔹 Verify OTP for Email
  async verifyOtpEmail(email: string, otp: string) {
    console.log(`🔍 Verifying OTP for email: ${email}`);
    const result = await this.otpService.verifyOtpEmail(email, otp);

    console.log(`✅ Email verified: ${email}`);
    await this.otpService.setVerifiedEmail(email);
    return result;
  }

  // 🔹 Verify OTP for Mobile
  async verifyOtpMobile(mobile: string, otp: string) {
    console.log(`🔍 Verifying OTP for mobile: ${mobile}`);
    const result = await this.otpService.verifyOtpMobile(mobile, otp);

    console.log(`✅ Mobile verified: ${mobile}`);
    await this.otpService.setVerifiedMobile(mobile);
    return result;
  }

  // 🔹 Create User (only after both email and mobile are verified)
  async createUser(createUserDto: CreateUserDto): Promise<User> {
    const { email, mobile,password } = createUserDto;

    if (!(await this.otpService.isEmailVerified(email))) {
      throw new UnauthorizedException('Email OTP is not verified');
    }

    if (!(await this.otpService.isMobileVerified(mobile))) {
      throw new UnauthorizedException('Mobile OTP is not verified');
    }

    createUserDto.password = await bcryptService.hashData(password);

    try {
      const newUser = new this.userModel(createUserDto);
      const savedUser = await newUser.save();
      console.log('✅ User registered successfully:', savedUser);
      return savedUser;
    } catch (error) {
      console.error('❌ Error saving user:', error);
      throw new Error('Failed to save user');
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

