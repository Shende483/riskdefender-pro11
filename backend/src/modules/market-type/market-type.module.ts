import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MarketTypeController } from './market-type.controller';
import { MarketTypeService } from './market-type.service';
import { MarketType, MarketTypeSchema } from './market-type.schema';
import { JwtModule } from '@nestjs/jwt';
import jwtConfing from 'src/config/jwt.confing';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: MarketType.name, schema: MarketTypeSchema },
    ]),
 JwtModule.registerAsync( jwtConfing.asProvider() ),
          

  ],
  controllers: [MarketTypeController],
  providers: [MarketTypeService],
})
export class MarketTypeModule {}
