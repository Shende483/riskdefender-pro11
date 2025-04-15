// dto/tradingRules.dto.ts
import { Type } from 'class-transformer';
import {
  IsArray,
  IsMongoId,
  ValidateNested,
  IsNotEmptyObject,
} from 'class-validator';
import { CreateRuleDto } from './rules.dto';
import { ApiProperty } from '@nestjs/swagger';

class RulesGroupDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateRuleDto)
  cash: CreateRuleDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateRuleDto)
  option: CreateRuleDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateRuleDto)
  future: CreateRuleDto[];
}

export class CreateTradingRulesDto {
  @IsMongoId()
  @ApiProperty({})
  marketTypeId: string;

  @ValidateNested()
  @Type(() => RulesGroupDto)
  @IsNotEmptyObject()
  rules: RulesGroupDto;
}
