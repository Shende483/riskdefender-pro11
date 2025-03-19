import { Controller, Post, Body, Res } from '@nestjs/common';
import { LoginService } from './login.service';
import { LoginUserDto } from './dto/login.dto';
import { Response } from 'express';

@Controller('auth')
export class LoginController {
  constructor(private loginService: LoginService) {}



  @Post('login')
  async login(@Body() loginUserDto: LoginUserDto, @Res() res: Response) {
    console.log("🔍 Received login request:", loginUserDto);

    const { email, mobile, password } = loginUserDto;
    console.log("eenen", email, mobile,password);

    await this.loginService.login(loginUserDto, res);


  }
}
