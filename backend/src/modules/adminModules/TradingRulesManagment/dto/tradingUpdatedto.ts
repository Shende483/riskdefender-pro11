import { IsNotEmpty, IsObject, IsString } from 'class-validator';

export class TradingRulesDto {
  @IsNotEmpty()
  @IsString()
  _id: string;
  marketTypeId: string;

  @IsObject()
  rules: {
    cash: string[];
    option: string[];
    future: string[];
  };
}
