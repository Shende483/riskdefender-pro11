import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateBrokerDto {
  @IsNotEmpty()
  @IsString()
  marketId: string;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  status?: string;
}
