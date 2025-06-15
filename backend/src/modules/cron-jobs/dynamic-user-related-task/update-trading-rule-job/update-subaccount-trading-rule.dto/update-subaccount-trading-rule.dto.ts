import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, Matches } from 'class-validator';

export class UpdateTradingRuleDto {

   @IsNotEmpty()
   @IsString()
   @Matches(/^[0-9a-fA-F]{24}$/, { message: 'brokerId must be a valid ObjectId' })
   @ApiProperty({ description: 'The ID of the broker', example: '60c72b2f9b1e8b001f6472d1' })
   brokerAccountId: string;


}