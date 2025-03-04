"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importDefault(require("../models/User"));
const authenticate = async (req, res, next) => {
    const bearer = req.headers.authorization;
    if (!bearer) {
        const error = new Error('Unauthorized');
        res.status(401).json({ error: error.message });
        return;
    }
    const [, token] = bearer.split(' ');
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        console.log(decoded);
        if (typeof decoded === 'object' && decoded.id) {
            const user = await User_1.default.findById(decoded.id).select('_id name email');
            if (user) {
                req.user = user;
                next();
            }
            else {
                res.status(500).json({ error: 'Token is not valid' });
            }
        }
    }
    catch (error) {
        res.status(500).json({ error: 'Token is not valid' });
    }
};
exports.authenticate = authenticate;
//# sourceMappingURL=auth.js.map