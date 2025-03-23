"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const redis_config_1 = require("./config/redis.config");
const login_module_1 = require("./modules/auth/loginAuth/login.module");
const register_module_1 = require("./modules/auth/registerAuth/register.module");
const database_config_1 = require("./config/database.config");
const subcription_module_1 = require("./modules/subcriptionDetails/subcription.module");
const forgetPassword_Module_1 = require("./modules/auth/forgetPasswordAuth/forgetPassword.Module");
const payment_module_1 = require("./modules/recordPayment/payment.module");
const UserUpdateInfo_module_1 = require("./modules/auth/updateUserInfoAuth/UserUpdateInfo.module");
const plan_module_1 = require("./modules/adminModules/planManage/plan.module");
const broker_module_1 = require("./modules/adminModules/BrokerManagment/broker.module");
const marketType_module_1 = require("./modules/adminModules/MarketType/marketType.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot(),
            database_config_1.DatabaseConfig,
            login_module_1.LoginModule,
            register_module_1.RegisterModule,
            forgetPassword_Module_1.ForgetPasswordModule,
            subcription_module_1.SubscriptionDetailsModule,
            payment_module_1.recordPaymnetModule,
            UserUpdateInfo_module_1.UpdateUserInfoModule,
            plan_module_1.AdminPlanModule,
            marketType_module_1.AdminMarketTypeModule,
            broker_module_1.AdminBrokersModule,
        ],
        providers: [redis_config_1.RedisService],
        exports: [redis_config_1.RedisService],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map