

/*
import { Controller, Post, Body } from '@nestjs/common';
import { LoginService } from './login.service';
import { LoginUserDto } from './dto/login.dto';

@Controller('auth')
export class LoginController {
  constructor(private loginService: LoginService) {}

  @Post('login/verify-email')
  async sendOtp(@Body('email') email: string) {
    return this.loginService.sendOtp(email);
  }

  @Post('login/verify-otp')
  async verifyOtp(@Body('email') email: string, @Body('otp') otp: string) {
    return this.loginService.verifyOtp(email, otp);
  }

  @Post('login')
  async login(@Body() loginUserDto: LoginUserDto) {
    return this.loginService.login(loginUserDto);
  }
}
*/

/*
import { Controller, Post, Body, UnauthorizedException } from '@nestjs/common';
import { LoginService } from './login.service';
import { LoginUserDto } from './dto/login.dto';

@Controller('auth')
export class LoginController {
  constructor(private loginService: LoginService) {}

  @Post('login/verify-email')
  async sendOtp(@Body('email') email: string) {
    return this.loginService.sendOtp(email);
  }

  @Post('login/verify-otp')
  async verifyOtp(@Body('email') email: string, @Body('otp') otp: string) {
    return this.loginService.verifyOtp(email, otp);
  }

  @Post('login')
  async login(@Body() loginUserDto: LoginUserDto) {
    const { email } = loginUserDto;

    // ✅ Check if email is verified before proceeding
    if (!this.loginService.isEmailVerified(email)) {
      throw new UnauthorizedException('Email is not verified. Please verify OTP.');
    }

    const response = await this.loginService.login(loginUserDto);

    // ✅ Clear verification status after successful login
    this.loginService.clearVerifiedEmail(email);

    return response;
  }
}
*/


/*
import { Controller, Post, Body, UnauthorizedException } from '@nestjs/common';
import { LoginService } from './login.service';
import { LoginUserDto } from './dto/login.dto';

@Controller('auth')
export class LoginController {
  constructor(private loginService: LoginService) {}

  @Post('login/verify-email')
  async sendOtp(@Body('email') email: string) {
    return this.loginService.sendOtp(email);
  }

  @Post('login/verify-otp')
  async verifyOtp(@Body('email') email: string, @Body('otp') otp: string) {
    return this.loginService.verifyOtp(email, otp);
  }

  @Post('login')
  async login(@Body() loginUserDto: LoginUserDto) {
    const { email } = loginUserDto;

    // ✅ Check if email is verified before proceeding (uses Redis)
    if (!(await this.loginService.isEmailVerified(email))) {
      throw new UnauthorizedException('Email is not verified. Please verify OTP.');
    }

    const response = await this.loginService.login(loginUserDto);

    // ✅ Clear verification status after successful login (uses Redis)
    await this.loginService.clearVerifiedEmail(email);

    return response;
  }
}
*/



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