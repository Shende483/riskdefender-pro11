"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bcryptService = void 0;
const bcrypt = require("bcrypt");
class bcryptService {
    static SALT_ROUNDS = 10;
    static async hashData(data) {
        return bcrypt.hash(data, this.SALT_ROUNDS);
    }
    static async compareData(data, hashedData) {
        return bcrypt.compare(data, hashedData);
    }
}
exports.bcryptService = bcryptService;
//# sourceMappingURL=bcrypt.service.js.map