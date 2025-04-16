// dtos/rule.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import {
  IsDefined,
  IsEnum,
  IsNotEmpty,
  IsString,
  ValidateIf,
  IsArray,
  ArrayNotEmpty,
} from 'class-validator';

export class CreateRuleDto {


  @IsString()
  @IsNotEmpty()
  name?: string;

  @IsString()
  @IsNotEmpty()
  description?: string;

  @IsString()
  @IsNotEmpty()
  key?: string;

  @IsEnum(['boolean', 'number', 'time', 'timerange', 'enum'])
  type: string;

  @ValidateIf((o: CreateRuleDto) => o.type === 'enum')
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  options?: string[];
  marketTypeId: unknown;
}
