
/*
import { Controller, Put, Body, Res, Req, NotFoundException,UseGuards } from '@nestjs/common';
import { RegisterService } from './UserUpdateInfo.service';
import { UpdateUserDto } from './dto/updateUserInfo.dto';
import { Response, Request } from 'express';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';

@Controller('auth')
export class RegisterController {
  constructor(private registerService: RegisterService) {}

  @Put('update-user')
    @UseGuards(JwtAuthGuard)
  async updateUser(
    @Body() updateUserDto: UpdateUserDto,
    @Req() req: Request, // Access the request object
    @Res() res: Response,
  ) {
    try {
      // Extract userId from the request (assuming it's added by a middleware or JWT guard)
      const userId = req['user'].userId;

      if (!userId) {
        return res.status(400).json({
          statusCode: 400,
          message: 'UserId is required',
          success: false,
        });
      }

      // Call the service to update the user
      const updatedUser = await this.registerService.updateUser(userId, updateUserDto);

      return res.status(200).json({
        statusCode: 200,
        message: 'User updated successfully',
        success: true,
        data: updatedUser,
      });
    } catch (error) {
      if (error instanceof NotFoundException) {
        return res.status(404).json({
          statusCode: 404,
          message: error.message,
          success: false,
        });
      }
      return res.status(500).json({
        statusCode: 500,
        message: 'Something went wrong. User not updated.',
        success: false,
      });
    }
  }
}
  */



import { Controller, Put, Post, Body, Res, Req, NotFoundException, UseGuards } from '@nestjs/common';
import { RegisterService } from './UserUpdateInfo.service';
import { UpdateUserDto } from './dto/updateUserInfo.dto';
import { Response, Request } from 'express';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';

@Controller('auth')
export class RegisterController {
  constructor(private registerService: RegisterService) {}

  @Put('update-user')
  @UseGuards(JwtAuthGuard)
  async updateUser(
    @Body() updateUserDto: UpdateUserDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    
      // Extract userId from the JWT token
      const userId = req['user'].userId;

      if (!userId) {
        return res.status(400).json({
          statusCode: 400,
          message: 'UserId is required',
          success: false,
        });
      }
      // Call the service to update the user
       await this.registerService.updateUser(userId, updateUserDto, res);
  }

  @Post('update-user/send-otp-email')
  @UseGuards(JwtAuthGuard)
  async sendOtpEmailForUpdate(
    @Body('email') email: string,
    @Res() res: Response,
  ) {
    console.log(`📩 Sending OTP to email for update: ${email}`);
    await this.registerService.sendOtpEmail(email, res);
  }

  @Post('update-user/send-otp-mobile')
  @UseGuards(JwtAuthGuard)
  async sendOtpMobileForUpdate(
    @Body('mobile') mobile: string,
    @Res() res: Response,
  ) {
    console.log(`📩 Sending OTP to mobile for update: ${mobile}`);
    await this.registerService.sendOtpMobile(mobile, res);
  }

  @Post('update-user/verify-otp-email')
  @UseGuards(JwtAuthGuard)
  async verifyOtpEmailForUpdate(
    @Body('email') email: string,
    @Body('otp') otp: string,
    @Res() res: Response,
  ) {
    console.log(`🔍 Verifying OTP for email update: ${email}`);
    await this.registerService.verifyOtpEmail(email, otp, res);
  }

  @Post('update-user/verify-otp-mobile')
  @UseGuards(JwtAuthGuard)
  async verifyOtpMobileForUpdate(
    @Body('mobile') mobile: string,
    @Body('otp') otp: string,
    @Res() res: Response,
  ) {
    console.log(`🔍 Verifying OTP for mobile update: ${mobile}`);
    await this.registerService.verifyOtpMobile(mobile, otp, res);
  }
}