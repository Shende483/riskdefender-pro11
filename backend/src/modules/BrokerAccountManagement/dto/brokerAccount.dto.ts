import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsObject, IsOptional, IsString } from 'class-validator';

export class BrokerAccountDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({})
  brokerId: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({})
  marketTypeId: string;

  @IsOptional()
  @IsString()
  @ApiProperty({})
  userId?: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({})
  subscriptionId: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({})
  brokerAccountName: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({})
  apiKey: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({})
  secretKey: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({})
  status: string;

  @IsObject()
  @IsNotEmpty()
  @ApiProperty({
    type: 'object',
    properties: {
      cash: { type: 'array', items: { type: 'string' } },
      option: { type: 'array', items: { type: 'string' } },
      future: { type: 'array', items: { type: 'string' } },
    },
  })
  tradingRuleData: {
    cash: string[];
    option: string[];
    future: string[];
  };
}
