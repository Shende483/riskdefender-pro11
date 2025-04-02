import { IsNotEmpty, IsObject, IsOptional, IsString } from 'class-validator';

export class BrokerAccountDto {
  @IsNotEmpty()
  @IsString()
  brokerId: string;

  @IsNotEmpty()
  @IsString()
  marketTypeId: string;

  @IsOptional()
  @IsString()
  userId?: string;

  @IsNotEmpty()
  @IsString()
  subscriptionId: string;

  @IsNotEmpty()
  @IsString()
  brokerAccountName: string;

  @IsNotEmpty()
  @IsString()
  apiKey: string;

  @IsNotEmpty()
  @IsString()
  secretKey: string;

  @IsNotEmpty()
  @IsString()
  status: string;

  @IsObject()
  @IsNotEmpty()
  tradingRuleData: {
    cash: string[];
    option: string[];
    future: string[];
  };
}
