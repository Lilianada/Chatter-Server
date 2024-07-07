const crypto = require('crypto');
const Token = require('../models/tokenModels');

class TokenService {
    static async generateToken(purpose) {
        const tokenValue = crypto.randomBytes(20).toString('hex');
        const expirationDate = new Date();
        expirationDate.setHours(expirationDate.getHours() + 24);

        const token = new Token({
            token: tokenValue,
            expireAt: expirationDate,
            isUsed: false,
            purpose
        });

        await token.save();
        return token;
    }

    static async verifyToken(tokenValue) {
        const token = await Token.findOne({
            token: tokenValue,
            isUsed: false,
            expireAt: { $gt: new Date() }
        });

        if (!token) {
            throw new Error('Invalid or expired token');
        }

        token.isUsed = true;
        await token.save();

        return token;
    }
}

module.exports = TokenService;
