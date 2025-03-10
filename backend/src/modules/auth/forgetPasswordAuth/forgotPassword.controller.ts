import { Controller, Post, Body, UnauthorizedException } from '@nestjs/common';
import { ForgetPasswordService } from './forgetPassword.service';
import { ForgetPasswordUserDto } from './dto/forgetPassword.dto';

@Controller('auth')
export class ForgetPasswordController {
  constructor(private forgetPasswordService: ForgetPasswordService) {}

  @Post('ForgetPassword/verify-email')
  async sendOtpEmail(@Body('email') email: string) {
    console.log("📩 Sending OTP for forget password (email):", email);
    return this.forgetPasswordService.sendOtpEmail(email);
  }

  @Post('ForgetPassword/verify-mobile')
  async sendOtpMobile(@Body('mobile') mobile: string) {
    return this.forgetPasswordService.sendOtpMobile(mobile);
  }

  @Post('ForgetPassword/verify-otp-email')
  async verifyOtpEmail(@Body('email') email: string, @Body('otp') otp: string) {
    return this.forgetPasswordService.verifyOtpEmail(email, otp);
  }

  @Post('ForgetPassword/verify-otp-mobile')
  async verifyOtpMobile(@Body('mobile') mobile: string, @Body('otp') otp: string) {
    return this.forgetPasswordService.verifyOtpMobile(mobile, otp);
  }

  @Post('ForgetPassword/update')
  async resetPassword(@Body() forgetPasswordUserData: ForgetPasswordUserDto) {
    console.log("🔍 Received Forget Password request:", forgetPasswordUserData);

    const { email, mobile } = forgetPasswordUserData;
    console.log("🔎 Processing reset for:", email || mobile);

    if (email) {
      const isVerified = await this.forgetPasswordService.isEmailVerified(email);
      if (!isVerified) {
        throw new UnauthorizedException('Email OTP is not verified. Please verify OTP.');
      }
      const response = await this.forgetPasswordService.resetPassword(forgetPasswordUserData);
      await this.forgetPasswordService.clearVerifiedEmail(email);
      return response;
    }

    if (mobile) {
      const isVerified = await this.forgetPasswordService.isMobileVerified(mobile);
      if (!isVerified) {
        throw new UnauthorizedException('Mobile OTP is not verified. Please verify OTP.');
      }
      const response = await this.forgetPasswordService.resetPassword(forgetPasswordUserData);
      await this.forgetPasswordService.clearVerifiedMobile(mobile);
      return response;
    }

    throw new UnauthorizedException('Either email or mobile is required for password reset.');
  }
}
