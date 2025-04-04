import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsNotEmpty,
  IsArray,
  ArrayNotEmpty,
  IsEnum,
  IsOptional,
} from 'class-validator';

export class PlanDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({})
  name: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({})
  description: string;

  @IsNotEmpty()
  @IsNumber()
  @ApiProperty({})
  price: number;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({})
  billingCycle: string;

  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  @ApiProperty({})
  features: string[];

  @IsOptional()
  @IsString()
  @ApiProperty({})
  status?: string; 
}
