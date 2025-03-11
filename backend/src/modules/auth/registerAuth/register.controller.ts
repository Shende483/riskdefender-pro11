import { UnauthorizedException } from '@nestjs/common';
import { Controller, Post, Body } from '@nestjs/common';
import { RegisterService } from './register.service';
import { CreateUserDto } from './dto/register.dto';
import { ApiTags, ApiOperation, ApiBody, ApiResponse } from '@nestjs/swagger';

@ApiTags('Auth - Registration')
@Controller('auth')
export class RegisterController {
  constructor(private RegisterService: RegisterService) {}

  @Post('register/verify-email')
  @ApiOperation({ summary: 'Send OTP to Email' })
  @ApiBody({ schema: { type: 'object', properties: { email: { type: 'string' } } } })
  async sendOtpEmail(@Body('email') email: string) {
    console.log("we recieved email", email);
    return this.RegisterService.sendOtpEmail(email);
  }

  @Post('register/verify-mobile')
  @ApiOperation({ summary: 'Send OTP to Mobile' })
  @ApiBody({ schema: { type: 'object', properties: { mobile: { type: 'string' } } } })
  async sendOtpMobile(@Body('mobile') mobileNo: string) {
    console.log("mofbb", mobileNo);
    return this.RegisterService.sendOtpMobile(mobileNo);
  }

  @Post('register/verify-otp-email')
  @ApiOperation({ summary: 'Verify OTP for Email' })
  @ApiBody({ schema: { type: 'object', properties: { email: { type: 'string' }, otp: { type: 'string' } } } })
  async verifyOtpEmail(@Body('email') email: string, @Body('otp') otp: string) {
    return this.RegisterService.verifyOtpEmail(email, otp);
  }

  @Post('register/verify-otp-mobile')
  @ApiOperation({ summary: 'Verify OTP for Mobile' })
  @ApiBody({ schema: { type: 'object', properties: { mobile: { type: 'string' }, otp: { type: 'string' } } } })
  async verifyOtpMobile(@Body('mobile') mobile: string, @Body('otp') otp: string) {
    return this.RegisterService.verifyOtpMobile(mobile, otp);
  }

  @Post('register')
  @ApiOperation({ summary: 'Register New User' })
  @ApiResponse({ status: 201, description: 'User registered successfully' })
  @ApiResponse({ status: 401, description: 'Email or Mobile OTP not verified' })
  async createUser(@Body() createUserDto: CreateUserDto) {
    const { email, mobile } = createUserDto;

    if (!(await this.RegisterService.isEmailVerified(email))) {
      throw new UnauthorizedException('Email is not verified. Please verify OTP.');
    }

    if (!(await this.RegisterService.isMobileVerified(mobile))) {
      throw new UnauthorizedException('Mobile number is not verified. Please verify OTP.');
    }

    const response = await this.RegisterService.createUser(createUserDto);

    await this.RegisterService.clearVerifiedEmail(email);
    await this.RegisterService.clearVerifiedMobile(mobile);

    return response;
  }
}


/*
import { UnauthorizedException } from '@nestjs/common';
import { Controller, Post, Body } from '@nestjs/common';
import { RegisterService } from './register.service';
import { CreateUserDto } from './dto/register.dto';

@Controller('auth')
export class RegisterController {
  constructor(private RegisterService: RegisterService) {}

  @Post('register/verify-email')
  async sendOtpEmail(@Body('email') email: string) {
    console.log("we recieved email",email)
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
*/

