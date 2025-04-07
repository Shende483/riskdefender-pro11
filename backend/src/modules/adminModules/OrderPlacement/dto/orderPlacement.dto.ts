import {
  ArrayNotEmpty,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class OrderPlacementDto {
  @IsString()
  @IsNotEmpty()
  marketTypeId: string;

  @IsEnum(['Cash', 'Future', 'Option'])
  orderType: 'Cash' | 'Future' | 'Option';

  @IsEnum(['Market', 'Stop', 'Limit'])
  orderPlacingType: 'Market' | 'Stop' | 'Limit';

  @IsString()
  symbol: string;

  @ArrayNotEmpty()
  @IsEnum(['SELL/SHORT', 'BUY/LONG'], { each: true })
  allowedDirection: string[];

  @ArrayNotEmpty()
  @IsEnum(['CROSSED', 'ISOLATED'], { each: true })
  marginTypes: string[];

  @IsNumber()
  @Min(1)
  @Max(100)
  maxLeverage: number;

  @IsNumber()
  @Min(0.1)
  @Max(100)
  maxRiskPercentage: number;

  @IsNumber()
  stopLoss: number;

  @IsNumber()
  targetPrice: number;

  @IsEnum(['active', 'deactive'])
  status: 'active' | 'deactive';
}
