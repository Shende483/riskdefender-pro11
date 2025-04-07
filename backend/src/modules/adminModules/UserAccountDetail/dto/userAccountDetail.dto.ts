import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber, Min, IsString, IsNotEmpty } from 'class-validator';

export class CreateUserAccountDetailsDto {
    @IsString()
    @IsNotEmpty()
    @ApiProperty({})
    marketTypeId: string;

    @IsEnum(['Cash', 'Future', 'Option'])
    orderType: string;

    @IsNumber()
    @Min(0)
    availableBalance: number;

    @IsNumber()
    @Min(0)
    todaysEntryCount: number;

    @IsNumber()
    @Min(0)
    entryCountInSymbol: number;

    @IsEnum(['active', 'inactive'])
    status: string;
}