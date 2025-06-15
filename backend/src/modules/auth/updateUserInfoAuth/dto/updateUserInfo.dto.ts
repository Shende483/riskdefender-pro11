import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class UpdateUserDto {

  @ApiProperty({})
  name: string;

  @ApiProperty({})
  lastName: string;

  @ApiProperty({})
  email: string;

  @ApiProperty({})
  countryCode: string;

  @ApiProperty({})
  mobile: string;

  @ApiProperty({})
  password: string;
}
