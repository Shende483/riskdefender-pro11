import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsObject, IsString } from 'class-validator';

export class TradingRulesDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({})
  marketTypeId: string;

  @IsObject()
  @ApiProperty({
    type: 'object',
    properties: {
      cash: { type: 'array', items: { type: 'string' } },
      option: { type: 'array', items: { type: 'string' } },
      future: { type: 'array', items: { type: 'string' } },
    },
  })
  rules: {

    cash: string[];
    option: string[];
    future: string[];
  };
}
