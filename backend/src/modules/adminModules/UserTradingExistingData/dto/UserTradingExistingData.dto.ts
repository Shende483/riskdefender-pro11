import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsString, IsNotEmpty, IsOptional, IsDateString } from 'class-validator';

export class UserTradingExistingDto {
    @IsString()
    @IsNotEmpty()
    @ApiProperty({})
    marketTypeId: string;

    @IsEnum(['Cash', 'Future', 'Option'])
    orderType: string;

    @IsNumber()
    myEntryToday: number;

    @IsNumber()
    myEntryCountInSymbol: number;

    @IsOptional()
    @IsDateString()
    myNextEntryTime?: Date;

    @IsEnum(['active', 'inactive'])
    status: string;
}