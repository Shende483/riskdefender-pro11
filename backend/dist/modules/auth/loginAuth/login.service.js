"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoginService = void 0;
const common_1 = require("@nestjs/common");
const register_service_1 = require("../registerAuth/register.service");
const jwt_1 = require("@nestjs/jwt");
const otp_service_1 = require("../../../common/otp.service");
const bcrypt_service_1 = require("../../../common/bcrypt.service");
let LoginService = class LoginService {
    usersService;
    jwtService;
    otpService;
    constructor(usersService, jwtService, otpService) {
        this.usersService = usersService;
        this.jwtService = jwtService;
        this.otpService = otpService;
    }
    async generateToken(user) {
        const payload = { id: user._id, email: user.email };
        return this.jwtService.sign(payload);
    }
    async login(loginUserDto, res) {
        const { email, mobile, password } = loginUserDto;
        console.log(`🔐 Attempting login for:`, { email, mobile });
        let user;
        if (email) {
            user = await this.usersService.findUserByEmail(email);
            if (!user) {
                res.status(400).json({
                    statusCode: 400,
                    message: 'User not found',
                    success: false,
                });
                return;
            }
            const isMatch = await bcrypt_service_1.bcryptService.compareData(String(password), user.password);
            if (!isMatch) {
                res.status(400).json({
                    statusCode: 400,
                    message: 'Invalid password',
                    success: false,
                });
                return;
            }
        }
        else if (mobile) {
            user = await this.usersService.findUserByMobile(mobile);
            if (!user) {
                res.status(400).json({
                    statusCode: 400,
                    message: 'User not found',
                    success: false,
                });
                return;
            }
            const isMatch = await bcrypt_service_1.bcryptService.compareData(String(password), user.password);
            if (!isMatch) {
                res.status(400).json({
                    statusCode: 400,
                    message: 'Invalid password',
                    success: false,
                });
                return;
            }
        }
        else {
            res.status(400).json({
                statusCode: 400,
                message: 'Either email or mobile is required for login.',
                success: false,
            });
            return;
        }
        console.log("User:", user);
        const accessToken = await this.generateToken(user);
        console.log("Generated Token:", accessToken);
        res.status(200).json({
            statusCode: 200,
            message: 'Login successful',
            success: true,
            access_token: accessToken
        });
    }
};
exports.LoginService = LoginService;
exports.LoginService = LoginService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [register_service_1.RegisterService,
        jwt_1.JwtService,
        otp_service_1.OtpService])
], LoginService);
//# sourceMappingURL=login.service.js.map