

import { Controller, Post, Body, UnauthorizedException } from '@nestjs/common';
import { ApiTags, ApiBody, ApiResponse, ApiOperation } from '@nestjs/swagger';
import { ForgetPasswordService } from './forgetPassword.service';
import { ForgetPasswordUserDto } from './dto/forgetPassword.dto';

@ApiTags('Authentication - Forget Password')
@Controller('auth')
export class ForgetPasswordController {
  constructor(private forgetPasswordService: ForgetPasswordService) {}

  @Post('ForgetPassword/verify-email')
  @ApiOperation({ summary: 'Send OTP for Forget Password (Email)' })
  @ApiBody({ schema: { properties: { email: { type: 'string', example: 'user@example.com' } } } })
  @ApiResponse({ status: 200, description: 'OTP sent successfully' })
  async sendOtpEmail(@Body('email') email: string) {
    console.log("📩 Sending OTP for forget password (email):", email);
    return this.forgetPasswordService.sendOtpEmail(email);
  }

  @Post('ForgetPassword/verify-mobile')
  @ApiOperation({ summary: 'Send OTP for Forget Password (Mobile)' })
  @ApiBody({ schema: { properties: { mobile: { type: 'string', example: '9876543210' } } } })
  @ApiResponse({ status: 200, description: 'OTP sent successfully' })
  async sendOtpMobile(@Body('mobile') mobile: string) {
    return this.forgetPasswordService.sendOtpMobile(mobile);
  }

  @Post('ForgetPassword/verify-otp-email')
  @ApiOperation({ summary: 'Verify OTP for Forget Password (Email)' })
  @ApiBody({ schema: { properties: { email: { type: 'string' }, otp: { type: 'string' } } } })
  @ApiResponse({ status: 200, description: 'OTP verified successfully' })
  async verifyOtpEmail(@Body('email') email: string, @Body('otp') otp: string) {
    return this.forgetPasswordService.verifyOtpEmail(email, otp);
  }

  @Post('ForgetPassword/verify-otp-mobile')
  @ApiOperation({ summary: 'Verify OTP for Forget Password (Mobile)' })
  @ApiBody({ schema: { properties: { mobile: { type: 'string' }, otp: { type: 'string' } } } })
  @ApiResponse({ status: 200, description: 'OTP verified successfully' })
  async verifyOtpMobile(@Body('mobile') mobile: string, @Body('otp') otp: string) {
    return this.forgetPasswordService.verifyOtpMobile(mobile, otp);
  }

  @Post('ForgetPassword/update')
  @ApiOperation({ summary: 'Reset Password' })
  @ApiBody({ type: ForgetPasswordUserDto })
  @ApiResponse({ status: 200, description: 'Password reset successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized - OTP not verified' })
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
