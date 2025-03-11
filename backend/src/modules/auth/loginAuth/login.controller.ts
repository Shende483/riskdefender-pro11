
/*
import { Controller, Post, Body, UnauthorizedException } from '@nestjs/common';
import { LoginService } from './login.service';
import { LoginUserDto } from './dto/login.dto';

@Controller('auth')
export class LoginController {
  constructor(private loginService: LoginService) {}

  @Post('login/verify-email')
  async sendOtpEmail(@Body('email') email: string) {
    console.log("enndjd",email)
    return this.loginService.sendOtpEmail(email);
  }

  @Post('login/verify-mobile')
  async sendOtpMobile(@Body('mobile') mobile: string) {
    return this.loginService.sendOtpMobile(mobile);
  }

  @Post('login/verify-otp-email')
  async verifyOtpEmail(@Body('email') email: string, @Body('otp') otp: string) {
    return this.loginService.verifyOtpEmail(email, otp);
  }

  @Post('login/verify-otp-mobile')
  async verifyOtpMobile(@Body('mobile') mobile: string, @Body('otp') otp: string) {
    return this.loginService.verifyOtpMobile(mobile, otp);
  }

 


@Post('login')
async login(@Body() loginUserDto: LoginUserDto) {
  console.log("🔍 Received login request:", loginUserDto);

  const { email, mobile } = loginUserDto;
console.log("eenen",email,mobile)
  if (email) {
    const isVerified = await this.loginService.isEmailVerified(email);
    if (!isVerified) {
      throw new UnauthorizedException('Email OTP is not verified. Please verify OTP.');
    }
    const response = await this.loginService.login(loginUserDto);
    await this.loginService.clearVerifiedEmail(email);
    return response;
  }

  if (mobile) {
    const isVerified = await this.loginService.isMobileVerified(mobile);
    if (!isVerified) {
      throw new UnauthorizedException('Mobile OTP is not verified. Please verify OTP.');
    }
    const response = await this.loginService.login(loginUserDto);
    await this.loginService.clearVerifiedMobile(mobile);
    return response;
  }

  throw new UnauthorizedException('Either email or mobile is required for login.');
}


}

*/





import { Controller, Post, Body, UnauthorizedException } from '@nestjs/common';
import { ApiTags, ApiBody, ApiResponse, ApiOperation } from '@nestjs/swagger';
import { LoginService } from './login.service';
import { LoginUserDto } from './dto/login.dto';

@ApiTags('Authentication')
@Controller('auth')
export class LoginController {
  constructor(private loginService: LoginService) {}

  @Post('login/verify-email')
  @ApiOperation({ summary: 'Send OTP for Email Verification' })
  @ApiBody({ schema: { properties: { email: { type: 'string', example: 'user@example.com' } } } })
  @ApiResponse({ status: 200, description: 'OTP sent successfully' })
  async sendOtpEmail(@Body('email') email: string) {
    console.log("enndjd", email);
    return this.loginService.sendOtpEmail(email);
  }

  @Post('login/verify-mobile')
  @ApiOperation({ summary: 'Send OTP for Mobile Verification' })
  @ApiBody({ schema: { properties: { mobile: { type: 'string', example: '9876543210' } } } })
  @ApiResponse({ status: 200, description: 'OTP sent successfully' })
  async sendOtpMobile(@Body('mobile') mobile: string) {
    return this.loginService.sendOtpMobile(mobile);
  }

  @Post('login/verify-otp-email')
  @ApiOperation({ summary: 'Verify OTP for Email' })
  @ApiBody({ schema: { properties: { email: { type: 'string' }, otp: { type: 'string' } } } })
  @ApiResponse({ status: 200, description: 'OTP verified successfully' })
  async verifyOtpEmail(@Body('email') email: string, @Body('otp') otp: string) {
    return this.loginService.verifyOtpEmail(email, otp);
  }

  @Post('login/verify-otp-mobile')
  @ApiOperation({ summary: 'Verify OTP for Mobile' })
  @ApiBody({ schema: { properties: { mobile: { type: 'string' }, otp: { type: 'string' } } } })
  @ApiResponse({ status: 200, description: 'OTP verified successfully' })
  async verifyOtpMobile(@Body('mobile') mobile: string, @Body('otp') otp: string) {
    return this.loginService.verifyOtpMobile(mobile, otp);
  }

  @Post('login')
  @ApiOperation({ summary: 'Login User' })
  @ApiBody({ type: LoginUserDto })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Unauthorized - OTP not verified' })
  async login(@Body() loginUserDto: LoginUserDto) {
    console.log("🔍 Received login request:", loginUserDto);

    const { email, mobile } = loginUserDto;
    console.log("eenen", email, mobile);

    if (email) {
      const isVerified = await this.loginService.isEmailVerified(email);
      if (!isVerified) {
        throw new UnauthorizedException('Email OTP is not verified. Please verify OTP.');
      }
      const response = await this.loginService.login(loginUserDto);
      await this.loginService.clearVerifiedEmail(email);
      return response;
    }

    if (mobile) {
      const isVerified = await this.loginService.isMobileVerified(mobile);
      if (!isVerified) {
        throw new UnauthorizedException('Mobile OTP is not verified. Please verify OTP.');
      }
      const response = await this.loginService.login(loginUserDto);
      await this.loginService.clearVerifiedMobile(mobile);
      return response;
    }

    throw new UnauthorizedException('Either email or mobile is required for login.');
  }
}
