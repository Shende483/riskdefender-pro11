



import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, IsUUID } from 'class-validator';

export class CreatePaymentDto {
  @ApiProperty({ example: '64f1a2b3c7e6d8e9f0a1b2c3' })
  @IsNotEmpty()
  @IsString()
  userId: string;

  @ApiProperty({ example: '64f1a2b3c7e6d8e9f0a1b2c5' })
  @IsNotEmpty()
  @IsString()
  subscriptionId: string;

  @ApiProperty({ example: 29.99 })
  @IsNotEmpty()
  @IsNumber()
  amount: number;

  @ApiProperty({ example: 'Credit Card' })
  @IsNotEmpty()
  @IsString()
  paymentMethod: string;

  @ApiProperty({ example: 'txn_123456789' })
  @IsNotEmpty()
  @IsString()
  transactionId: string;

  @ApiProperty({ example: 'success' })
  @IsNotEmpty()
  @IsString()
  status: string;
}



