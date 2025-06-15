import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateBrokerDto { 
  @IsNotEmpty()
  @IsString()
  @ApiProperty({})
  _id: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({})
  name: string;

  @IsOptional()
  @IsString()
  @ApiProperty({})
  status?: string;
}
