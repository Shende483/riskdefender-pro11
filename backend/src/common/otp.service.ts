

import { Injectable,UnauthorizedException, Inject } from '@nestjs/common';
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
     return { message: `✅ OTP sent successfully to ${email}`,statuscode:201,success:true };
    }
     catch (error) {
      console.error(`❌ Failed to send OTP to ${email}:`, error);
      return { message: `❌ Failed to send OTP,Incorrect eamil:${email}:`, error,statuscode:400, success:false };
    }
  }



  async verifyOtpEmail(email: string, enteredOtp: string) {

    try {
      await this.verifyStoredOtp(`otp:${email}`, enteredOtp);
      await this.setVerified(`verified:${email}`);
      return { message: `OTP verified successfully for ${email}`,statuscode:201, success:true };
    } catch (error) {
      console.error(`❌ Error during OTP verification for ${email}:`, error);
      return { message: '❌ Invalid OTP ', statuscode: 500, success: false };
    }
  
  }


  
  async isEmailVerified(email: string): Promise<boolean> {
    return this.isVerified(`verified:${email}`);
  }

  async clearVerifiedEmail(email: string): Promise<void> {
    await this.clearVerified(`verified:${email}`);
  }

  async sendOtpMobile(mobile: string, context: string) {
    const dummyOtp = '999999';
    const useDummyOtp = true; // Toggle this to `false` when enabling real SMS service

    const otp = useDummyOtp ? dummyOtp : await this.generateOtp();
    const expiresIn = 15 * 60; // 15 minutes
    await this.storeOtp(`otp:${mobile}`, otp, expiresIn);

    if (!useDummyOtp) {
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
        return { message: `✅ OTP sent successfully to ${mobile}`,statuscode:201,success:true };
        console.log(`✅ Mobile OTP sent to ${mobile}`);
      } catch (error) {
        console.error(`❌ Failed to send Mobile OTP:`, error);
        return { message: `❌ Failed to send OTP to ${mobile}:`, error,statuscode:400, success:false }
      }
    } else {
      console.log(`📲 Using Dummy OTP for mobile verification: ${dummyOtp}`);
      return { message: `✅ OTP sent successfully to ${mobile} ,dummy otp is 999999`,statuscode:201,success:true };
    }

  }




  async verifyOtpMobile(mobile: string, enteredOtp: string) {
    try {
      await this.verifyStoredOtp(`otp:${mobile}`, enteredOtp);
      await this.setVerified(`verified:${mobile}`);
      return { message: `OTP verified successfully for ${mobile}`,statuscode:201, success:true };
    } catch (error) {
      console.error(`❌ Error during OTP verification for ${mobile}:`, error);
      return { message: '❌ Invalid OTP ', statuscode: 500, success: false };
    }
   
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












