
import { IsString, IsNumber, IsDate, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateSubscriptionDetailsDto {
  @IsNotEmpty()
  @IsString()
  userId: string;

  @IsNotEmpty()
  @IsNumber()
  totalAllotmentAccount: number;

  @IsNotEmpty()
  @IsString()
  subAccountName: string;


  @IsNotEmpty()
  @IsDate()
  startDate: Date;

  @IsNotEmpty()
  @IsDate()
  endDate: Date;

  @IsNotEmpty()
  @IsString()
  status: string;
}
