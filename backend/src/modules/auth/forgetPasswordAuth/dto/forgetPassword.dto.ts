
import { IsNotEmpty, IsOptional, IsString, IsEmail, Matches } from 'class-validator';

export class ForgetPasswordUserDto {

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
