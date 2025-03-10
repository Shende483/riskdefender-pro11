

/*

import { Injectable, UnauthorizedException, Inject } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import Redis from 'ioredis';

@Injectable()
export class OtpService {
  constructor(@Inject('REDIS_CLIENT') private readonly redisClient: Redis) {}

  async sendOtp(email: string, context: string) {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresIn = 15 * 60; // 15 minutes

    // ✅ Store OTP in Redis
    await this.redisClient.set(`otp:${email}`, otp, 'EX', expiresIn);

    console.log(`📩 Generating OTP for ${context}: ${email}`);
    console.log(`🔢 OTP: ${otp} (Valid for 15 min)`);
    
    // ✅ Log stored OTP in Redis
    const storedOtp = await this.redisClient.get(`otp:${email}`);
    console.log(`🛢️ OTP stored in Redis: ${storedOtp}`);

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    try {
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: `OTP for ${context}`,
        text: `Dear user, your OTP is ${otp}. It is valid for 15 minutes.`,
      });
      console.log(`✅ OTP sent successfully to ${email}`);
    } catch (error) {
      console.error(`❌ Failed to send OTP to ${email}:`, error);
      throw new UnauthorizedException('Failed to send OTP. Please try again.');
    }

    return { message: `OTP sent successfully to ${email}` };



  }





  async verifyOtp(email: string, enteredOtp: string) {
    console.log(`🔍 Verifying OTP for ${email}`);

    // ✅ Retrieve OTP from Redis
    const storedOtp = await this.redisClient.get(`otp:${email}`);
    console.log(`📤 Retrieved OTP from Redis: ${storedOtp}`);

    if (!storedOtp) {
      console.warn(`⚠️ OTP expired or not found for ${email}`);
      throw new UnauthorizedException('OTP expired or invalid');
    }

    if (storedOtp !== enteredOtp) {
      console.error(`❌ Invalid OTP entered for ${email}`);
      throw new UnauthorizedException('Invalid OTP');
    }

    // ✅ Delete OTP after verification
    await this.redisClient.del(`otp:${email}`);
    console.log(`🗑️ OTP deleted from Redis for: ${email}`);

    // ✅ Store email verification status in Redis
    await this.setVerifiedEmail(email);

    return { message: 'OTP verified successfully' };
  }

  // ✅ Store verified email in Redis
  public async setVerifiedEmail(email: string) {
    await this.redisClient.set(`verified:${email}`, 'true');
    console.log(`📌 Email marked as verified: ${email}`);

    // ✅ Log stored verified email in Redis
    const verifiedStatus = await this.redisClient.get(`verified:${email}`);
    console.log(`🛢️ Verified email stored in Redis: ${verifiedStatus}`);
  }

  // ✅ Check if email is verified in Redis
  public async isEmailVerified(email: string): Promise<boolean> {
    const exists = await this.redisClient.get(`verified:${email}`);
    console.log(`🔎 Checking verified status in Redis: ${exists}`);
    return exists === 'true';
  }

  // ✅ Clear email verification status in Redis
  public async clearVerifiedEmail(email: string): Promise<void> {
    await this.redisClient.del(`verified:${email}`);
    console.log(`🗑️ Verification status deleted from Redis for: ${email}`);
  }
}



*/


import { Injectable, UnauthorizedException, Inject } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import Redis from 'ioredis';
import axios from 'axios';

@Injectable()
export class OtpService {
  constructor(@Inject('REDIS_CLIENT') private readonly redisClient: Redis) {}

  private async generateOtp(): Promise<string> {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  private async storeOtp(key: string, otp: string, expiresIn: number) {
    await this.redisClient.set(key, otp, 'EX', expiresIn);
    console.log(`🛢️ OTP stored in Redis for ${key}: ${otp}`);
  }

  private async verifyStoredOtp(key: string, enteredOtp: string): Promise<void> {
    const storedOtp = await this.redisClient.get(key);
    console.log(`📤 Retrieved OTP from Redis for ${key}: ${storedOtp}`);

    if (!storedOtp) {
      console.warn(`⚠️ OTP expired or not found for ${key}`);
      throw new UnauthorizedException('OTP expired or invalid');
    }

    if (storedOtp !== enteredOtp) {
      console.error(`❌ Invalid OTP entered for ${key}`);
      throw new UnauthorizedException('Invalid OTP');
    }

    await this.redisClient.del(key);
    console.log(`🗑️ OTP deleted from Redis for: ${key}`);
  }

  private async setVerified(key: string) {
    await this.redisClient.set(key, 'true');
    console.log(`📌 ${key} marked as verified.`);
  }


  async setVerifiedEmail(email: string) {
    await this.redisClient.set(`verified:${email}`, 'true');
    console.log(`📌 Email marked as verified: ${email}`);
  }

  private async isVerified(key: string): Promise<boolean> {
    const exists = await this.redisClient.get(key);
    console.log(`🔎 Checking verified status in Redis: ${exists}`);
    return exists === 'true';
  }

  private async clearVerified(key: string) {
    await this.redisClient.del(key);
    console.log(`🗑️ Verification status deleted from Redis for: ${key}`);
  }

  async sendOtpEmail(email: string, context: string) {
    const otp = await this.generateOtp();
    const expiresIn = 15 * 60; // 15 minutes
    await this.storeOtp(`otp:${email}`, otp, expiresIn);

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    try {
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: `OTP for ${context}`,
        text: `Dear user, your OTP is ${otp}. It is valid for 15 minutes.`,
      });
      console.log(`✅ OTP sent successfully to ${email}`);
    } catch (error) {
      console.error(`❌ Failed to send OTP to ${email}:`, error);
      throw new UnauthorizedException('Failed to send OTP. Please try again.');
    }

    return { message: `OTP sent successfully to ${email}` };
  }

  async verifyOtpEmail(email: string, enteredOtp: string) {
    await this.verifyStoredOtp(`otp:${email}`, enteredOtp);
    await this.setVerified(`verified:${email}`);
    return { message: 'OTP verified successfully' };
  }

  async isEmailVerified(email: string): Promise<boolean> {
    return this.isVerified(`verified:${email}`);
  }

  async clearVerifiedEmail(email: string): Promise<void> {
    await this.clearVerified(`verified:${email}`);
  }

  async sendOtpMobile(mobile: string, context: string) {
    const otp = await this.generateOtp();
    const expiresIn = 15 * 60; // 15 minutes
    await this.storeOtp(`otp:${mobile}`, otp, expiresIn);

    try {
      await axios.get('https://www.fast2sms.com/dev/bulkV2', {
        params: {
          authorization: process.env.FAST2SMS_API_KEY,
          variables_values: otp,
          route: 'otp',
          numbers: mobile,
        },
        headers: {
          'cache-control': 'no-cache',
        },
      });
      console.log(`✅ Mobile OTP sent to ${mobile}`);
    } catch (error) {
      console.error(`❌ Failed to send Mobile OTP:`, error);
      throw new UnauthorizedException('Failed to send OTP. Please try again.');
    }

    return { message: `OTP sent successfully to ${mobile}` };
  }

  async verifyOtpMobile(mobile: string, enteredOtp: string) {
    await this.verifyStoredOtp(`otp:${mobile}`, enteredOtp);
    await this.setVerified(`verified:${mobile}`);
    return { message: 'OTP verified successfully' };
  }



  
  async setVerifiedMobile(mobile: string) {
    await this.redisClient.set(`verified:${mobile}`, 'true');
    console.log(`📌 Mobile marked as verified: ${mobile}`);
  }
  


  async isMobileVerified(mobile: string): Promise<boolean> {
    return this.isVerified(`verified:${mobile}`);
  }

  async clearVerifiedMobile(mobile: string): Promise<void> {
    await this.clearVerified(`verified:${mobile}`);
  }
}
