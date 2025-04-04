import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({})
  name: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({})
  lastName: string;

  @IsEmail()
  @IsNotEmpty()
  @ApiProperty({})
  email: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({})
  countryCode: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({})
  mobile: string;

  @IsString()
  @MinLength(6)
  @ApiProperty({})
  password: string;
}
