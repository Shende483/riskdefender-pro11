import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class UpdatePlanDto {

  @IsNotEmpty() // Ensure ID is provided
  @IsString()
  @ApiProperty({})
  _id: string;
  

  @IsNotEmpty()
  @IsNumber()
  @ApiProperty({})
  price: number;

  @IsArray()
  @ApiProperty({})
  features: string[];
  static _id: any;
}
