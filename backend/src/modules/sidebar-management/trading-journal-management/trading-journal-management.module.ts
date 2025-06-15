import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { TradingJournalController } from './trading-journal-management.controller';
import { TradingJournalService } from './trading-journal-management.service';
import jwtConfing from 'src/config/jwt.confing';
import { TradingJournalManagement, TradingJournalManagementSchema } from './trading-journal-management.schema';
 // Adjust the path as needed


@Module({
  imports: [
    MongooseModule.forFeature([
      { name: TradingJournalManagement.name, schema: TradingJournalManagementSchema },
    ]),
       JwtModule.registerAsync(jwtConfing.asProvider()),
  ],
  controllers: [TradingJournalController],
  providers: [TradingJournalService],
})
export class TradingJournalModule {}