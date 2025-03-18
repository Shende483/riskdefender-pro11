
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { RegisterService } from '../registerAuth/register.service';
import { JwtService } from '@nestjs/jwt';
import { LoginUserDto } from './dto/login.dto';
import { OtpService } from '../../../common/otp.service';
import { bcryptService } from 'src/common/bcrypt.service';
import { Response } from 'express';

@Injectable()
export class LoginService {
  constructor(
    private usersService: RegisterService,
    private jwtService: JwtService,
    private otpService: OtpService,
  ) {}



  async generateToken(user: any): Promise<string> {
    const payload = { id: user._id, email: user.email };
    return this.jwtService.sign(payload);
  }

  async sendOtpEmail(email: string, res: Response) {
    console.log(`📩 Sending OTP for login (email): ${email}`);
    const user = await this.usersService.findUserByEmail(email);
    if (!user) {
      res.status(400).json({
        statusCode: 400,
        message: 'User not found',
        success: false,
      });
      return;
    }
    const response = await this.otpService.sendOtpEmail(email, 'login');
    res.status(200).json({
      statusCode: response.statuscode,
      message: response.message,
      success: response.success,
    });
  }

  async sendOtpMobile(mobile: string, res: Response) {
    console.log(`📩 Sending OTP for login (mobile): ${mobile}`);
    const user = await this.usersService.findUserByMobile(mobile);
    if (!user) {
      res.status(400).json({
        statusCode: 400,
        message: 'User not found',
        success: false,
      });
      return;
    }
    const response = await this.otpService.sendOtpMobile(mobile, 'login');
    res.status(200).json({
      statusCode: response.statuscode,
      message: response.message,
      success: response.success,
    });
  }

  async verifyOtpEmail(email: string, otp: string, res: Response) {
    console.log(`🔍 Verifying OTP for email: ${email}`);
    const response = await this.otpService.verifyOtpEmail(email, otp);
    res.status(200).json({
      statusCode: response.statuscode,
      message: response.message,
      success: response.success,
    });
    console.log(`✅ Storing verification status for email: ${email}`);
    await this.otpService.setVerifiedEmail(email);
  }

  async verifyOtpMobile(mobile: string, otp: string, res: Response) {
    console.log(`🔍 Verifying OTP for mobile: ${mobile}`);
    const response = await this.otpService.verifyOtpMobile(mobile, otp);
    res.status(200).json({
      statusCode: response.statuscode,
      message: response.message,
      success: response.success,
    });
    console.log(`✅ Storing verification status for mobile: ${mobile}`);
    await this.otpService.setVerifiedMobile(mobile);
  }

  async login(loginUserDto: LoginUserDto, res: Response) {
    const { email, mobile, password } = loginUserDto;
    console.log(`🔐 Attempting login for:`, { email, mobile });

    let user;
    if (email) {
      user = await this.usersService.findUserByEmail(email);
      if (!user) {
        res.status(400).json({
          statusCode: 400,
          message: 'User not found',
          success: false,
        });
        return;
      }
      const isMatch = await bcryptService.compareData(String(password), user.password)
      if (!isMatch) {
        res.status(400).json({
          statusCode: 400,
          message: 'Invalid password',
          success: false,
        });
        return;
      }
      await this.otpService.clearVerifiedEmail(email);
    } else if (mobile) {
      user = await this.usersService.findUserByMobile(mobile);
      if (!user) {
        res.status(400).json({
          statusCode: 400,
          message: 'User not found',
          success: false,
        });
        return;
      }
      const isMatch = await bcryptService.compareData(String(password), user.password)
      if (!isMatch) {
        res.status(400).json({
          statusCode: 400,
          message: 'Invalid password',
          success: false,
        });
        return;
      }
      await this.otpService.clearVerifiedMobile(mobile);
    } else {
      res.status(400).json({
        statusCode: 400,
        message: 'Either email or mobile is required for login.',
        success: false,
      });
      return;
    }




    console.log("User:", user); 
    const accessToken = await this.generateToken(user); // Corrected placement for token generation
    console.log("Generated Token:", accessToken); // Corrected console log


    
    res.status(200).json({
      statusCode: 200,
      message: 'Login successful',
      success: true,
      access_token: accessToken
    });



    
  }

  async isEmailVerified(email: string): Promise<boolean> {
    return this.otpService.isEmailVerified(email);
  }

  async isMobileVerified(mobile: string): Promise<boolean> {
    return this.otpService.isMobileVerified(mobile);
  }

  async clearVerifiedEmail(email: string): Promise<void> {
    await this.otpService.clearVerifiedEmail(email);
  }

  async clearVerifiedMobile(mobile: string): Promise<void> {
    await this.otpService.clearVerifiedMobile(mobile);
  }
}
