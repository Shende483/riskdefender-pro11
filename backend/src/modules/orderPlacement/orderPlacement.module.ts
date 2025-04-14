import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  OrderPlacementSchema,
  OrderPlacementType,
} from './orderPlacement.schema';
import { MarketType, MarketTypeSchema } from '../adminModules/MarketType/marketType.schema';
import { JwtModule } from '@nestjs/jwt';
import jwtConfing from 'src/config/jwt.confing';
import { OrderPlacementService } from './orderPlacement.service';
import { OrderPlacementController } from './orderPlacement.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: OrderPlacementType.name, schema: OrderPlacementSchema },
      { name: MarketType.name, schema: MarketTypeSchema },
    ]),
    JwtModule.registerAsync(jwtConfing.asProvider()),
  ],
  controllers: [OrderPlacementController],
  providers: [OrderPlacementService],
})
export class AdminOrderPlacementModule {}
