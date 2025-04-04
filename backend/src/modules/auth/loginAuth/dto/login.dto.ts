
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class LoginUserDto {
  @ApiProperty({})
  email: string;

  mobile:string;

  otp?: string;

  @ApiPropertyOptional({})
  password?: string;
}



