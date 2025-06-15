

import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsIn } from 'class-validator';

export class PenaltyPlanDto {
  @ApiProperty({
    description: 'Type of penalty plan (e.g., updatePenalty, trailingPenalty, closePositionPenalty)',
    example: 'updatePenalty',
  })
  @IsString()
  @IsNotEmpty()
  @IsIn(['updatePenalty', 'trailingPenalty', 'closePositionPenalty'], {
    message: 'planType must be one of: updatePenalty, trailingPenalty, closePositionPenalty',
  })
  planType: string;
}