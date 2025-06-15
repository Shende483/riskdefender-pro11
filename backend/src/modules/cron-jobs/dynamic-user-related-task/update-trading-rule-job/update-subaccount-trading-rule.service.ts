import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SchedulerRegistry } from '@nestjs/schedule';
import { Request, Response } from 'express';
import { BrokerAccount, BrokerAccountDocument } from 'src/modules/sidebar-management/subaccount-management/sub-broker-account.schema';
import { PendingUpdate, PendingUpdateDocument } from './update-subaccount-trading-rule.schema';


@Injectable()
export class UpdateTradingRuleService implements OnModuleInit {
  constructor(
    private schedulerRegistry: SchedulerRegistry,
    @InjectModel(BrokerAccount.name) private brokerAccountModel: Model<BrokerAccountDocument>,
    @InjectModel(PendingUpdate.name) private pendingUpdateModel: Model<PendingUpdateDocument>,
  ) {}

  async onModuleInit() {
    const now = new Date();
    const pendingUpdates = await this.pendingUpdateModel.find().exec();

    for (const update of pendingUpdates) {
      if (update.updateEnd >= now) {
        await this.scheduleUpdateCancellation(
          update.userId.toString(),
          update.brokerAccountId.toString(),
          update.updateEnd
        );
        console.log(
          `Restored cron job for trading rule update cancellation of subaccount ${update.brokerAccountId}, scheduled for ${update.updateEnd.toISOString()}`
        );
      } else {
        await this.cancelUpdateInternal(update.userId.toString(), update.brokerAccountId.toString());
        console.log(
          `Immediately cancelled overdue update for subaccount ${update.brokerAccountId} for user ${update.userId}`
        );
      }
    }

    await this.pendingUpdateModel.deleteMany({ updateEnd: { $lt: now } }).exec();
  }

  private async scheduleUpdateCancellation(userId: string, brokerAccountId: string, updateEnd: Date) {
    const cronName = `update_trading_rule_${brokerAccountId}`;
    const timeToCancellation = updateEnd.getTime() - Date.now();

    if (timeToCancellation <= 0) {
      await this.cancelUpdateInternal(userId, brokerAccountId);
      return;
    }

    const timeout = setTimeout(async () => {
      await this.cancelUpdateInternal(userId, brokerAccountId);
      this.schedulerRegistry.deleteTimeout(cronName);
    }, timeToCancellation);

    this.schedulerRegistry.addTimeout(cronName, timeout);
  }

  async cancelUpdateInternal(userId: string, brokerAccountId: string) {
    await this.pendingUpdateModel.deleteOne({ brokerAccountId }).exec();
    console.log(
      `Trading rule update for subaccount ${brokerAccountId} cancelled for user ${userId} at ${new Date().toISOString()}`
    );
  }

  async requestUpdate(userId: string, brokerAccountId: string, req: Request, res: Response) {
    const account = await this.brokerAccountModel
      .findOne({ _id: brokerAccountId, userId })
      .exec();

    if (!account) {
      return res.status(200).json({
        statusCode: 404,
        message: `Subaccount ${brokerAccountId} not found for user ${userId}`,
        success: false,
      });
    }

    const existingUpdate = await this.pendingUpdateModel
      .findOne({ brokerAccountId })
      .exec();

    if (existingUpdate) {
      return res.status(200).json({
        statusCode: 400,
        message: `Subaccount ${brokerAccountId} already has a pending trading rule update`,
        success: false,
      });
    }

    const now = new Date();
    const updateStart = new Date(now.getTime() +  1 * 1000); // Start after 5 days
    const updateEnd = new Date(updateStart.getTime() + 24 * 60 * 60 * 1000); // End after 24 hours

    await this.pendingUpdateModel.create({
      userId,
      brokerAccountId,
      updateStart,
      updateEnd,
    });

    await this.scheduleUpdateCancellation(userId, brokerAccountId, updateEnd);

    return res.status(200).json({
      statusCode: 200,
      message: `Trading rule update for subaccount ${brokerAccountId} scheduled from ${updateStart.toISOString()} to ${updateEnd.toISOString()}`,
      success: true,
    });
  }

  public async cancelUpdate(userId: string, brokerAccountId: string, req: Request, res: Response) {
    const update = await this.pendingUpdateModel
      .findOne({ brokerAccountId, userId })
      .exec();

    if (!update) {
      return res.status(200).json({
        statusCode: 404,
        message: `No trading rule update request found for subaccount ${brokerAccountId}`,
        success: false,
      });
    }

    await this.pendingUpdateModel.deleteOne({ _id: update._id }).exec();

    const cronName = `update_trading_rule_${brokerAccountId}`;
    if (this.schedulerRegistry.doesExist('timeout', cronName)) {
      this.schedulerRegistry.deleteTimeout(cronName);
    }

    return res.status(200).json({
      statusCode: 200,
      message: `Trading rule update request for subaccount ${brokerAccountId} cancelled`,
      success: true,
    });
  }

  async isUpdateAllowed(brokerAccountId: string): Promise<boolean> {
    const now = new Date();
    const update = await this.pendingUpdateModel
      .findOne({
        brokerAccountId,
        updateStart: { $lte: now },
        updateEnd: { $gte: now },
      })
      .exec();
    return !!update;
  }
}