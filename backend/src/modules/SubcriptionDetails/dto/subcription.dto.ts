import { IsString, IsNumber, IsDateString, IsNotEmpty } from 'class-validator';

export class CreateSubscriptionDetailsDto {
  @IsNotEmpty()
  @IsString()
  userId: Object;

  @IsNotEmpty()
  @IsString()
  planId: string;

  @IsNotEmpty()
  @IsString()
  planName: string;

  @IsNotEmpty()
  @IsNumber()
  numberOfBroker: number;


  @IsDateString()
  startDate: Date;

  @IsNotEmpty()
  @IsDateString()
  endDate: Date;
;
  @IsString()
  status: string;
}
