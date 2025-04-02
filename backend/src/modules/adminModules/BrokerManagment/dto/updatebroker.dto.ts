import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateBrokerDto { 
  @IsNotEmpty()
  @IsString()
  _id: string;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  status?: string;
}
