import { IsString, IsNumber, IsDateString, IsNotEmpty } from 'class-validator';

export class CreateSubscriptionDetailsDto {
  @IsNotEmpty()
  @IsString()
  userId: Object;

  @IsNotEmpty()
  @IsString()
  planName: string;

  @IsNotEmpty()
  @IsNumber()
  numberOfBroker: number;


  @IsDateString()
  activeDateTime: Date;

  @IsNotEmpty()
  @IsDateString()
  expireDateTime: Date;


  @IsString()
  transactionId: string;

 
  @IsDateString()
  transactionDate: Date;


  @IsString()
  status: string;
}
