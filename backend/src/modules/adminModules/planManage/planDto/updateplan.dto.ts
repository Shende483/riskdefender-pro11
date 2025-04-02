import { IsArray, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class UpdatePlanDto {

  @IsNotEmpty() // Ensure ID is provided
  @IsString()
  _id: string;
  

  @IsNotEmpty()
  @IsNumber()
  price: number;

  @IsArray()
  features: string[];
  static _id: any;
}
