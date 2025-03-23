import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class UpdateUserDto {

  name: string;
  lastName: string;
  email: string;
  countryCode: string;
  mobile: string;
  password: string;
}
