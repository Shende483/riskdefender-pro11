
/*
// src/module/users/users.controller.ts
import { UnauthorizedException } from '@nestjs/common';
import { Controller, Post, Body } from '@nestjs/common';
import { RegisterService } from './register.service';
import { CreateUserDto } from './dto/register.dto';


@Controller('auth')
export class RegisterController {
  constructor(private RegisterService: RegisterService) {}

  @Post('register/verify-email')
  async sendOtp(@Body('email') email: string) {
    return this.RegisterService.sendOtp(email);
  }

  @Post('register/verify-otp')
  async verifyOtp(@Body('email') email: string, @Body('otp') otp: string) {
    return this.RegisterService.verifyOtp(email, otp);
  }


  @Post('register')
  async createUser(@Body() createUserDto: CreateUserDto) {
  const  email  = createUserDto.email;
    // ✅ Check if email is verified before proceeding (uses Redis)
    if (!(await this.RegisterService.isEmailVerified(email))) {
      throw new UnauthorizedException('Email is not verified. Please verify OTP.');
    }

    const response = await this.RegisterService.createUser(createUserDto);
    await this.RegisterService.clearVerifiedEmail(email);
    return response;
  }
}

*/


import { UnauthorizedException } from '@nestjs/common';
import { Controller, Post, Body } from '@nestjs/common';
import { RegisterService } from './register.service';
import { CreateUserDto } from './dto/register.dto';

@Controller('auth')
export class RegisterController {
  constructor(private RegisterService: RegisterService) {}

  @Post('register/verify-email')
  async sendOtpEmail(@Body('email') email: string) {
    return this.RegisterService.sendOtpEmail(email);
  }

  @Post('register/verify-mobile')
  async sendOtpMobile(@Body('mobile') mobileNo: string) {
    console.log("mofbb",mobileNo)
    return this.RegisterService.sendOtpMobile(mobileNo);
  }

  @Post('register/verify-otp-email')
  async verifyOtpEmail(@Body('email') email: string, @Body('otp') otp: string) {
    return this.RegisterService.verifyOtpEmail(email, otp);
  }

  @Post('register/verify-otp-mobile')
  async verifyOtpMobile(@Body('mobile') mobile: string, @Body('otp') otp: string) {
    return this.RegisterService.verifyOtpMobile(mobile, otp);
  }

  @Post('register')
  async createUser(@Body() createUserDto: CreateUserDto) {
    const { email, mobile } = createUserDto;

    // ✅ Ensure both email & mobile OTPs are verified before registration
    if (!(await this.RegisterService.isEmailVerified(email))) {
      throw new UnauthorizedException('Email is not verified. Please verify OTP.');
    }

    if (!(await this.RegisterService.isMobileVerified(mobile))) {
      throw new UnauthorizedException('Mobile number is not verified. Please verify OTP.');
    }

    const response = await this.RegisterService.createUser(createUserDto);

    // ✅ Clear OTP verification status after successful registration
    await this.RegisterService.clearVerifiedEmail(email);
    await this.RegisterService.clearVerifiedMobile(mobile);

    return response;
  }
}


