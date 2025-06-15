import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BrokerAccount, BrokerAccountSchema } from './sub-broker-account.schema';
import { JwtModule } from '@nestjs/jwt';
import jwtConfing from 'src/config/jwt.confing';
import { SubBrokerAccountController } from './sub-broker-account.controller';
import { SubBrokerAccountService } from './sub-broker-account.service';
import {User,UserSchema} from 'src/modules/auth/updateUserInfoAuth/UserUpdateInfo.schema';
import {Broker,BrokerSchema} from '../../adminModules/BrokerManagment/broker.schema';
import {MarketType,MarketTypeSchema} from '../../adminModules/MarketType/marketType.schema';
import { KafkaModule } from 'src/common/kafka/kafka.module';
import { ApiKeyVerificationService } from './api-secret-verification.service';
import { ProxyService, ProxyServiceSchema } from 'src/modules/proxy-service-management/proxy-management.schema';
import { SubbrokerPayment, SubbrokerPaymentSchema } from 'src/modules/payment-management/multiple-payment-schema/subbroker-payment.schema';
import { PendingDeletion, PendingDeletionSchema } from 'src/modules/cron-jobs/dynamic-user-related-task/delete-broker-job/delete-user-subaccount.schema';
import { PendingUpdate, PendingUpdateSchema } from 'src/modules/cron-jobs/dynamic-user-related-task/update-trading-rule-job/update-subaccount-trading-rule.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: BrokerAccount.name, schema: BrokerAccountSchema },
      { name: Broker.name, schema: BrokerSchema },
      { name: User.name, schema: UserSchema },
      { name: MarketType.name, schema: MarketTypeSchema },
      { name:SubbrokerPayment.name, schema:SubbrokerPaymentSchema},
      { name:ProxyService.name, schema: ProxyServiceSchema },
      { name:PendingDeletion.name, schema:PendingDeletionSchema },
      { name:PendingUpdate.name,    schema:PendingUpdateSchema}

    ]),
    KafkaModule,
    JwtModule.registerAsync(jwtConfing.asProvider()),
  ],
  controllers: [SubBrokerAccountController],
  providers: [SubBrokerAccountService, ApiKeyVerificationService,],
})
export class SubBrokerAccountModule {}
