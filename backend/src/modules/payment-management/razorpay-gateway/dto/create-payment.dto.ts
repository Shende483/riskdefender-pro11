
import { IsNotEmpty, IsNumber, IsString, IsOptional, IsEnum, IsObject } from 'class-validator';

export class CreatePaymentDto {
  @IsNotEmpty()
  @IsString()
  planId: string;

  @IsOptional()
  @IsString()
  couponCode: string;

  @IsNotEmpty()
  @IsNumber()
  amount: number;

  @IsNotEmpty()
  @IsString()
  currency: string;

  @IsNotEmpty()
  @IsEnum(['createBroker', 'renewBroker', 'tradingJournalRenew', 'alertRenew', 'penaltyPayment'])
  paymentType: 'createBroker' | 'renewBroker' | 'tradingJournalRenew'  | 'alertRenew' | 'penaltyPayment';

}
