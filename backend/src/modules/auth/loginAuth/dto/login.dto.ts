

import { IsEmail, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class LoginUserDto {
  email: string;
  mobile:string;
  otp?: string;
  password?: string;
}



