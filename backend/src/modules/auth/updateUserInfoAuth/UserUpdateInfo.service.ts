import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../registerAuth/register.schema';
import { UpdateUserDto } from './dto/updateUserInfo.dto';
import { bcryptService } from 'src/common/bcrypt.service';
import { OtpService } from 'src/common/otp.service';
import { Response } from 'express';

@Injectable()
export class RegisterService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private otpService: OtpService,
  ) {}

  // 🔹 Update User Details
  async updateUser(userId: string, updateUserDto: UpdateUserDto, res: Response): Promise<User | void> {
    const user = await this.userModel.findById(userId).exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if email is being updated
    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const isEmailVerified = await this.otpService.isEmailVerified(updateUserDto.email);
      if (isEmailVerified) {
        user.email = updateUserDto.email;
        await this.otpService.clearVerifiedEmail(updateUserDto.email);
        res.status(200).json({
          statusCode: 200,
          message: '✅ User updated successfully',
          success: true,
          data: user.email,
        });
      } else {
         res.status(400).json({
          statusCode: 400,
          message: '❌ New email is not verified. Please verify OTP.',
          success: false,
        });
      }
    }

    // Check if mobile is being updated
    if (updateUserDto.mobile && updateUserDto.mobile !== user.mobile) {
      const isMobileVerified = await this.otpService.isMobileVerified(updateUserDto.mobile);
      if (isMobileVerified) {
        user.mobile = updateUserDto.mobile;
        await this.otpService.clearVerifiedMobile(updateUserDto.mobile);
        res.status(200).json({
          statusCode: 200,
          message: '✅ User updated successfully',
          success: true,
          data: user.mobile,
        });
      } else {
         res.status(400).json({
          statusCode: 400,
          message: '❌ New mobile number is not verified. Please verify OTP.',
          success: false,
        });
      }
    }

    // Update other fields if provided
    if (updateUserDto.name) {
      user.name = updateUserDto.name;
    }
    if (updateUserDto.lastName) {
      user.lastName = updateUserDto.lastName;
    }
    if (updateUserDto.countryCode) {
      user.countryCode = updateUserDto.countryCode;
    }
    if (updateUserDto.password) {
      user.password = await bcryptService.hashData(updateUserDto.password);
    }

    // Save the updated user
    try {
      const updatedUser = await user.save();
      console.log('✅ User updated successfully:', updatedUser);

    res.status(200).json({
        statusCode: 200,
        message: '✅ User updated successfully',
        success: true,
        data: updatedUser,
      });
    } catch (error) {
    //  console.error('❌ Error updating user:');
       res.status(500).json({
        statusCode: 500,
        message: '❌ Something went wrong. User not updated.',
        success: false,
      });
    }
  }

  // 🔹 Send OTP for Email
  async sendOtpEmail(email: string, res: Response) {
    console.log(`📩 Sending OTP to email: ${email}`);

    const response = await this.otpService.sendOtpEmail(email, 'update');
    return res.status(200).json({
      statusCode: 200,
      message: response.message,
      success: response.success,
    });
  }

  // 🔹 Send OTP for Mobile
  async sendOtpMobile(mobile: string, res: Response) {
    console.log(`📩 Sending OTP to mobile: ${mobile}`);

    const response = await this.otpService.sendOtpMobile(mobile, 'update');
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
}







