import { Controller, Post, Body, Res } from '@nestjs/common';
import { LoginService } from './login.service';
import { LoginUserDto } from './dto/login.dto';
import { Response } from 'express';

@Controller('auth')
export class LoginController {
  constructor(private loginService: LoginService) {}

  @Post('login/verify-email')
  async sendOtpEmail(@Body('email') email: string, @Res() res: Response) {
    console.log("enndjd", email);
    await this.loginService.sendOtpEmail(email, res);
  }

  @Post('login/verify-mobile')
  async sendOtpMobile(@Body('mobile') mobile: string, @Res() res: Response) {
    await this.loginService.sendOtpMobile(mobile, res);
  }

  @Post('login/verify-otp-email')
  async verifyOtpEmail(@Body('email') email: string, @Body('otp') otp: string, @Res() res: Response) {
    await this.loginService.verifyOtpEmail(email, otp, res);
  }

  @Post('login/verify-otp-mobile')
  async verifyOtpMobile(@Body('mobile') mobile: string, @Body('otp') otp: string, @Res() res: Response) {
    await this.loginService.verifyOtpMobile(mobile, otp, res);
  }

  @Post('login')
  async login(@Body() loginUserDto: LoginUserDto, @Res() res: Response) {
    console.log("🔍 Received login request:", loginUserDto);

    const { email, mobile } = loginUserDto;
    console.log("eenen", email, mobile);




    if (email) {
      const isVerified = await this.loginService.isEmailVerified(email);
      if (!isVerified) {
        res.status(401).json({
          statusCode: 401,
          message: 'Email OTP is not verified. Please verify OTP.',
          success: false,
        });
        return;
      }
      await this.loginService.login(loginUserDto, res);
      await this.loginService.clearVerifiedEmail(email);
      return;
    }

    if (mobile) {
      const isVerified = await this.loginService.isMobileVerified(mobile);
      if (!isVerified) {
        res.status(401).json({
          statusCode: 401,
          message: 'Mobile OTP is not verified. Please verify OTP.',
          success: false,
        });
        return;
      }
      await this.loginService.login(loginUserDto, res);
      await this.loginService.clearVerifiedMobile(mobile);
      return;
    }


    res.status(400).json({
      statusCode: 400,
      message: 'Either email or mobile is required for login.',
      success: false,
    });
  }
}
