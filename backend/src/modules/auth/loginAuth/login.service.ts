
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { RegisterService } from '../registerAuth/register.service';
import { JwtService } from '@nestjs/jwt';
import { LoginUserDto } from './dto/login.dto';
import { OtpService } from '../../../common/otp.service';

@Injectable()
export class LoginService {
  constructor(
    private usersService: RegisterService,
    private jwtService: JwtService,
    private otpService: OtpService,
  ) {}

  async sendOtp(email: string) {
    console.log(`📩 Sending OTP for login: ${email}`);
    const user = await this.usersService.findUserByEmail(email);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return this.otpService.sendOtp(email, 'login');
  }

  async verifyOtp(email: string, otp: string) {
    console.log(`🔍 Verifying OTP for: ${email}`);
    const result = await this.otpService.verifyOtp(email, otp);

    // ✅ Store email verification status in Redis
    console.log(`✅ Storing verification status for: ${email}`);
    await this.otpService.setVerifiedEmail(email);

    return result;
  }

  async login(loginUserDto: LoginUserDto) {
    const { email, password } = loginUserDto;
    console.log(`🔐 Attempting login for: ${email}`);

    const user = await this.usersService.findUserByEmail(email);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    if (user.password !== password) {
      throw new UnauthorizedException('Invalid password');
    }

    return {
      message: 'Login successful',
      access_token: this.jwtService.sign({ email, userId: user._id }),
    };
  }

  // ✅ Check if email is verified before login (uses Redis)
  async isEmailVerified(email: string): Promise<boolean> {
    return this.otpService.isEmailVerified(email);
  }

  // ✅ Clear verification status after login (uses Redis)
  async clearVerifiedEmail(email: string): Promise<void> {
    await this.otpService.clearVerifiedEmail(email);
  }
}
