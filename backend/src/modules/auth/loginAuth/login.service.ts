
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

}
