import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TradingRulesController } from './tradingRules.controller';
import { TradingRulesService } from './tradingRules.service';
import { TradingRules, TradingRulesSchema } from './tradingRules.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: TradingRules.name, schema: TradingRulesSchema }, // Register the schema
    ]),
  ],
  controllers: [TradingRulesController], // Register the controller
  providers: [TradingRulesService], // Register the service
})
export class TradingRulesModule {}