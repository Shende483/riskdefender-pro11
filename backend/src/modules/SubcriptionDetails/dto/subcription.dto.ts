import { IsString, IsNumber, IsDateString, IsNotEmpty } from 'class-validator';

export class CreateSubscriptionDetailsDto {
  @IsNotEmpty()
  @IsString()
  userId: string;

  @IsNotEmpty()
  @IsString()
  planName: string;

  @IsNotEmpty()
  @IsNumber()
  numberOfBroker: number;

  @IsNotEmpty()
  @IsDateString()
  activeDateTime: Date;

  @IsNotEmpty()
  @IsDateString()
  expireDateTime: Date;

  @IsNotEmpty()
  @IsString()
  transactionId: string;

  @IsNotEmpty()
  @IsDateString()
  transactionDate: Date;

  @IsNotEmpty()
  @IsString()
  status: string;
}
