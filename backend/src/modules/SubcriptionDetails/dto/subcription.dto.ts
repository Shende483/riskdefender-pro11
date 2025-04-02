import { IsString, IsNumber, IsDateString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSubscriptionDetailsDto {
  @ApiProperty({ description: 'User ID associated with the subscription', example: '60d0fe4f5311236168a109ca' })
  @IsNotEmpty()
  @IsString()
  userId: string;

  @ApiProperty({ description: 'Plan ID', example: 'basic-plan' })
  @IsNotEmpty()
  @IsString()
  planId: string;

  @ApiProperty({ description: 'Plan Name', example: 'Basic Subscription' })
  @IsNotEmpty()
  @IsString()
  planName: string;

  @ApiProperty({ description: 'Number of Brokers allowed', example: 5 })
  @IsNotEmpty()
  @IsNumber()
  numberOfBroker: number;

  @ApiProperty({ description: 'Start Date of the Subscription', example: '2025-03-24T00:00:00.000Z' })
  @IsDateString()
  startDate: Date;

  @ApiProperty({ description: 'End Date of the Subscription', example: '2025-06-24T00:00:00.000Z' })
  @IsDateString()
  endDate: Date;

  @ApiProperty({ description: 'Subscription Status', example: 'active' })
  @IsString()
  status: string;


  subscriptionId:string;

}
