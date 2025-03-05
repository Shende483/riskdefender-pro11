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


