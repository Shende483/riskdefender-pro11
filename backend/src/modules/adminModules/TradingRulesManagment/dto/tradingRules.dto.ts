import { IsNotEmpty, IsObject, IsString } from 'class-validator';

export class TradingRulesDto {
  @IsString()
  @IsNotEmpty()
  marketTypeId: string;

  @IsObject()

  rules: {
    cash: string[];
    option: string[];
    future: string[];
  };
}
