
/*
import { IsEmail, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class LoginUserDto {
  email: string;
  mobile:string;
  otp?: string;
  password?: string;
}

*/
import { IsNotEmpty, IsOptional, IsString, IsEmail, Matches } from 'class-validator';

export class LoginUserDto {

  @IsOptional()
  @IsEmail({}, { message: 'Invalid email format' })
  email?: string;


  mobile?: string;


  @IsNotEmpty()
  @IsString()
  emailOrMobile: string;

  @IsOptional()
  @IsString()
  otp?: string;

  @IsOptional()
  @IsString()
  password?: string;
}
