import { IsString, IsNotEmpty } from 'class-validator';

export class TradingRuleResetDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  schedule: string;
}