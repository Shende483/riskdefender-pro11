import { Injectable, UnauthorizedException } from '@nestjs/common';
import { RegisterService } from '../registerAuth/register.service';

import { ForgetPasswordUserDto } from './dto/forgetPassword.dto';
import { OtpService } from '../../../common/otp.service';
import { bcryptService } from 'src/common/bcrypt.service';

@Injectable()
export class ForgetPasswordService {
  constructor(
    private usersService: RegisterService,
    private otpService: OtpService,
  ) {}

  async sendOtpEmail(email: string) {
    console.log(`📩 Sending OTP for forget password (email): ${email}`);
    const user = await this.usersService.findUserByEmail(email);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return this.otpService.sendOtpEmail(email, 'forget-password');
  }

  async sendOtpMobile(mobile: string) {
    console.log(`📩 Sending OTP for forget password (mobile): ${mobile}`);
    const user = await this.usersService.findUserByMobile(mobile);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return this.otpService.sendOtpMobile(mobile, 'forget-password');
  }

  async verifyOtpEmail(email: string, otp: string) {
    console.log(`🔍 Verifying OTP for email: ${email}`);
    const result = await this.otpService.verifyOtpEmail(email, otp);

    console.log(`✅ Storing verification status for email: ${email}`);
    await this.otpService.setVerifiedEmail(email);

    return result;
  }

  async verifyOtpMobile(mobile: string, otp: string) {
    console.log(`🔍 Verifying OTP for mobile: ${mobile}`);
    const result = await this.otpService.verifyOtpMobile(mobile, otp);

    console.log(`✅ Storing verification status for mobile: ${mobile}`);
    await this.otpService.setVerifiedMobile(mobile);

    return result;
  }



  async resetPassword(forgetPasswordUserDto: ForgetPasswordUserDto) {
    const { email, mobile, password } = forgetPasswordUserDto;
    console.log(`🔐 Attempting password reset for:`, { email, mobile });

    let user;
    if (email) {
        user = await this.usersService.findUserByEmail(email);
        if (!user) throw new UnauthorizedException('User not found');

        if (!await this.isEmailVerified(email)) {
            throw new UnauthorizedException('Email OTP is not verified.');
        }

        const newPassword = await bcryptService.hashData(String(password));
        await this.usersService.updateUserPassword(user._id, newPassword);
        await this.otpService.clearVerifiedEmail(email);
    } else if (mobile) {
        user = await this.usersService.findUserByMobile(mobile);
        if (!user) throw new UnauthorizedException('User not found');

        if (!await this.isMobileVerified(mobile)) {
            throw new UnauthorizedException('Mobile OTP is not verified.');
        }

        const newPassword = await bcryptService.hashData(String(password));
        await this.usersService.updateUserPassword(user._id, newPassword);
        await this.otpService.clearVerifiedMobile(mobile);
    } else {
        throw new UnauthorizedException('Either email or mobile is required for password reset.');
    }

    return { message: 'Password reset successful' };
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
