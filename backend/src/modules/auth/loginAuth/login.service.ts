/*
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
*/


/*
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

  async sendOtp(emailOrMobile: string) {
    console.log(`📩 Sending OTP for login: ${emailOrMobile}`);
    const user = await this.usersService.findUserByEmailOrMobile(emailOrMobile);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return user.email === emailOrMobile
      ? this.otpService.sendOtpEmail(emailOrMobile, 'login')
      : this.otpService.sendOtpMobile(emailOrMobile, 'login');
  }

  async verifyOtp(emailOrMobile: string, otp: string) {
    console.log(`🔍 Verifying OTP for: ${emailOrMobile}`);
    const result = emailOrMobile.includes('@')
      ? await this.otpService.verifyOtpEmail(emailOrMobile, otp)
      : await this.otpService.verifyOtpMobile(emailOrMobile, otp);

    console.log(`✅ Storing verification status for: ${emailOrMobile}`);
    emailOrMobile.includes('@')
      ? await this.otpService.setVerifiedEmail(emailOrMobile)
      : await this.otpService.setVerifiedMobile(emailOrMobile);

    return result;
  }

  async login(loginUserDto: LoginUserDto) {
    const { emailOrMobile, password } = loginUserDto;
    console.log(`🔐 Attempting login for: ${emailOrMobile}`);

    const user = await this.usersService.findUserByEmailOrMobile(emailOrMobile);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    if (user.password !== password) {
      throw new UnauthorizedException('Invalid password');
    }

    return {
      message: 'Login successful',
      access_token: this.jwtService.sign({ emailOrMobile, userId: user._id }),
    };
  }

  async isVerified(emailOrMobile: string): Promise<boolean> {
    return emailOrMobile.includes('@')
      ? this.otpService.isEmailVerified(emailOrMobile)
      : this.otpService.isMobileVerified(emailOrMobile);
  }

  async clearVerified(emailOrMobile: string): Promise<void> {
    emailOrMobile.includes('@')
      ? await this.otpService.clearVerifiedEmail(emailOrMobile)
      : await this.otpService.clearVerifiedMobile(emailOrMobile);
  }
}
*/


import { Injectable, UnauthorizedException } from '@nestjs/common';
import { RegisterService } from '../registerAuth/register.service';
import { JwtService } from '@nestjs/jwt';
import { LoginUserDto } from './dto/login.dto';
import { OtpService } from '../../../common/otp.service';
import { bcryptService } from 'src/common/bcrypt.service';

@Injectable()
export class LoginService {
  constructor(
    private usersService: RegisterService,
    private jwtService: JwtService,
    private otpService: OtpService,
  ) {}

  async sendOtpEmail(email: string) {
    console.log(`📩 Sending OTP for login (email): ${email}`);
    const user = await this.usersService.findUserByEmail(email);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return this.otpService.sendOtpEmail(email, 'login');
  }

  async sendOtpMobile(mobile: string) {
    console.log(`📩 Sending OTP for login (mobile): ${mobile}`);
    const user = await this.usersService.findUserByMobile(mobile);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return this.otpService.sendOtpMobile(mobile, 'login');
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

   async login(loginUserDto: LoginUserDto) {

    const { email, mobile, password } = loginUserDto;
    console.log(`🔐 Attempting login for:`, { email, mobile });
  
    let user;
    if (email) {
      user = await this.usersService.findUserByEmail(email);
      if (!user) throw new UnauthorizedException('User not found');
  
      // ✅ Compare hashed password with input password
      const isMatch = await bcryptService.compareData(String(password), user.password)
      if (!isMatch) throw new UnauthorizedException('Invalid password');
  
      await this.otpService.clearVerifiedEmail(email);
    } else if (mobile) {
      user = await this.usersService.findUserByMobile(mobile);
      if (!user) throw new UnauthorizedException('User not found');
  
      // ✅ Compare hashed password with input password
      const isMatch = await bcryptService.compareData(String(password), user.password)
      if (!isMatch) throw new UnauthorizedException('Invalid password');
  
      await this.otpService.clearVerifiedMobile(mobile);
    } else {
      throw new UnauthorizedException('Either email or mobile is required for login.');
    }
 




    return {
      message: 'Login successful',
      access_token: this.jwtService.sign({ userId: user._id, email: user.email, mobile: user.mobile }),
    };
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
