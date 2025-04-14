import {
  ArrayNotEmpty,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class OrderPlacementDto {
  @ApiProperty({
    description: 'The ID of the market type',
    example: '654321abcdef0987654321',
  })
  @IsString()
  @IsNotEmpty()
  marketTypeId: string;

  @ApiProperty({
    description: 'The type of order',
    enum: ['cash', 'future', 'option']
  })
  @IsEnum(['cash', 'future', 'option'])
  orderType: 'cash' | 'future' | 'option';

  @ApiProperty({
    description: 'The type of order placing',
    enum: ['Market', 'Stop'],
    example: 'Limit',
  })
  @IsOptional()
  @IsEnum(['Market', 'Stop'])
  orderPlacingType: 'Market' | 'Stop';

  @ApiProperty({
    description: 'The trading symbol',
    example: 'AAPL',
  })
  @IsString()
  symbol: string;

  @ApiProperty({
    description: 'The allowed trading directions',
    enum: ['SELL', 'BUY'],
  })
  @IsOptional()
  @IsEnum(['SELL', 'BUY'], { each: true })
  allowedDirection: string[];

  @ApiProperty({
    description: 'The margin types allowed',
    enum: ['CROSS', 'ISOLATED'],
  })
  @IsOptional()
  @IsEnum(['CROSS', 'ISOLATED'], { each: true })
  marginTypes: string[];

  @ApiProperty({
    description: 'The maximum allowed leverage',
  })
  @IsNumber()
  maxLeverage: number;

  @ApiProperty({
    description: 'The maximum allowed risk percentage',
  })
  @IsNumber()
  maxRiskPercentage: number;

  @ApiProperty({
    description: 'The stop-loss price',
    example: 150.5,
  })
  @IsNumber()
  stopLoss: number;
  
  @ApiProperty({
    description: 'The stop-loss price',
    example: 150.5,
  })
  @IsNumber()
  entryPrice: number;

  @ApiProperty({
    description: 'The target price',
    example: 160.0,
  })
  @IsNumber()
  targetPrice: number;

  @ApiProperty({
    description: 'The status of the order placement configuration',
    enum: ['active', 'deactive'],
    example: 'active',
  })
  @IsEnum(['active', 'deactive'])
  status: 'active' | 'deactive';
}
