import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateBrokerDto {
  @IsNotEmpty()
  @IsString()
  marketTypeId: string;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  status?: string;
}
