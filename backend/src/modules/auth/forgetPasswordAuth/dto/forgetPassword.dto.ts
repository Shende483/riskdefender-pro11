
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsEmail, Matches } from 'class-validator';

export class ForgetPasswordUserDto {

  @IsOptional()
  @IsEmail({}, { message: 'Invalid email format' })
  @ApiProperty({})
  email?: string;

  @ApiProperty({})
  mobile?: string;


  @IsNotEmpty()
  @IsString()
  @ApiProperty({})
  emailOrMobile: string;

  @IsOptional()
  @IsString()
  @ApiProperty({})
  otp?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({})
  password?: string;
}
