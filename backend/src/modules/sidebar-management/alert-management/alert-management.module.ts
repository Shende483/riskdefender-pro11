import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { JwtModule } from '@nestjs/jwt';
import jwtConfing from 'src/config/jwt.confing';
import { AlertController } from './alert-management.controller';
import { AlertService } from './alert-management.service';
import { AlertManagement, AlertManagementSchema } from './alert-management.schema';


@Module({
  imports: [
    MongooseModule.forFeature([
      { name: AlertManagement.name, schema: AlertManagementSchema },
    ]),
     JwtModule.registerAsync(jwtConfing.asProvider()),
  ],
  controllers: [AlertController],
  providers: [AlertService],
})
export class AlertModule {}