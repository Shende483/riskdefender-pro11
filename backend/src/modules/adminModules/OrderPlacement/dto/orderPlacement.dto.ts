import {
  ArrayNotEmpty,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsString,
  Max,
  Min,
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
    enum: ['Cash', 'Future', 'Option'],
    example: 'Future',
  })
  @IsEnum(['Cash', 'Future', 'Option'])
  orderType: 'Cash' | 'Future' | 'Option';

  @ApiProperty({
    description: 'The type of order placing',
    enum: ['Market', 'Stop', 'Limit'],
    example: 'Limit',
  })
  @IsEnum(['Market', 'Stop', 'Limit'])
  orderPlacingType: 'Market' | 'Stop' | 'Limit';

  @ApiProperty({
    description: 'The trading symbol',
    example: 'AAPL',
  })
  @IsString()
  symbol: string;

  @ApiProperty({
    description: 'The allowed trading directions',
    enum: ['SELL/SHORT', 'BUY/LONG'],
    example: ['BUY/LONG'],
    isArray: true,
  })
  @ArrayNotEmpty()
  @IsEnum(['SELL/SHORT', 'BUY/LONG'], { each: true })
  allowedDirection: string[];

  @ApiProperty({
    description: 'The margin types allowed',
    enum: ['CROSSED', 'ISOLATED'],
    example: ['ISOLATED'],
    isArray: true,
  })
  @ArrayNotEmpty()
  @IsEnum(['CROSSED', 'ISOLATED'], { each: true })
  marginTypes: string[];

  @ApiProperty({
    description: 'The maximum allowed leverage',
    minimum: 1,
    maximum: 100,
    example: 10,
  })
  @IsNumber()
  @Min(1)
  @Max(100)
  maxLeverage: number;

  @ApiProperty({
    description: 'The maximum allowed risk percentage',
    minimum: 0.1,
    maximum: 100,
    example: 1,
  })
  @IsNumber()
  @Min(0.1)
  @Max(100)
  maxRiskPercentage: number;

  @ApiProperty({
    description: 'The stop-loss price',
    example: 150.5,
  })
  @IsNumber()
  stopLoss: number;

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
