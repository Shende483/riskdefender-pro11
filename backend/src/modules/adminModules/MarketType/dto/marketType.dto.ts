import { IsNotEmpty, IsString } from 'class-validator';

export class CreateMarketTypeDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsNotEmpty()
  status: string;

  @IsNotEmpty()
  @IsNotEmpty()
  createAt: Date;

  @IsNotEmpty()
  @IsNotEmpty()
  updateAt: Date;
}
