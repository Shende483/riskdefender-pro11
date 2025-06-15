import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsObject, IsOptional, IsString } from 'class-validator';

export class userTradingDto {
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
  brokerAccountName: string;

  @IsObject()
  @ApiProperty({
    type: 'object',
    properties: {
      cash: { type: 'array', items: { type: 'string' } },
      option: { type: 'array', items: { type: 'string' } },
      future: { type: 'array', items: { type: 'string' } },
    },
  })
  existing: {
    cash: string[];
    option: string[];
    future: string[];
  };
  _id: any;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({})
  status: string;
}
