import { UnauthorizedException } from '@nestjs/common';
import { Controller, Post, Body, Res } from '@nestjs/common';
import { RegisterService } from './register.service';
import { ApiBody } from '@nestjs/swagger';
import { CreateUserDto } from './dto/register.dto';
import { Response } from 'express';

@Controller('auth')
export class RegisterController {
  constructor(private RegisterService: RegisterService) {}

  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: { type: 'string', example: 'user@example.com' }, 
      },
    },
  })
  @Post('register/verify-email')
  async sendOtpEmail(@Body('email') email: string, @Res() res: Response) {
    console.log("we received email", email);
    await this.RegisterService.sendOtpEmail(email,res);
  }

  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        mobile: {type: 'string'}
      },
    },
  })
  @Post('register/verify-mobile')
  async sendOtpMobile(@Body('mobile') mobile: string, @Res() res: Response) {
    console.log("mofbb", mobile);
    await this.RegisterService.sendOtpMobile(mobile,res);
  }

  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: { type: 'string'}, 
        otp: {type: 'string'}
      },
    },
  })
  @Post('register/verify-otp-email')
  async verifyOtpEmail(@Body('email') email: string, @Body('otp') otp: string, @Res() res: Response,) {
    return this.RegisterService.verifyOtpEmail(email, otp,res);
  }

  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        mobile: { type: 'string'}, 
        otp: {type: 'string'}
      },
    },
  })
  @Post('register/verify-otp-mobile')
  async verifyOtpMobile(@Body('mobile') mobile: string, @Body('otp') otp: string, @Res() res: Response  ) {
    return this.RegisterService.verifyOtpMobile(mobile, otp ,res);
  }

  @Post('register')
  async createUser(@Body() createUserDto: CreateUserDto , @Res() res: Response) {
    const { email, mobile } = createUserDto;

    /*
    if (!(await this.RegisterService.isEmailVerified(email))) {
      throw new UnauthorizedException('Email is not verified. Please verify OTP.');
    }

    if (!(await this.RegisterService.isMobileVerified(mobile))) {
      throw new UnauthorizedException('Mobile number is not verified. Please verify OTP.');
    }
    */

    const response = await this.RegisterService.createUser(createUserDto,res);

    await this.RegisterService.clearVerifiedEmail(email);
    await this.RegisterService.clearVerifiedMobile(mobile);

    return response;
  }
}
