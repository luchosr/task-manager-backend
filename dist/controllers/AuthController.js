"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const AuthEmail_1 = require("./../emails/AuthEmail");
const User_1 = __importDefault(require("../models/User"));
const auth_1 = require("../utils/auth");
const Token_1 = __importDefault(require("../models/Token"));
const token_1 = require("../utils/token");
const jwt_1 = require("../utils/jwt");
class AuthController {
    static createAccount = async (req, res) => {
        try {
            const { password, email } = req.body;
            const userExists = await User_1.default.findOne({ email });
            if (userExists) {
                const error = new Error('User already exists');
                res.status(409).json({ error: error.message });
                return;
            }
            const user = new User_1.default(req.body);
            user.password = await (0, auth_1.hashPassword)(password);
            const token = new Token_1.default();
            token.token = (0, token_1.generateToken)();
            token.user = user.id;
            AuthEmail_1.AuthEmail.sendConfirmationEmail({
                email: user.email,
                name: user.name,
                token: token.token,
            });
            await Promise.allSettled([user.save(), token.save()]);
            res.send('Account created, please check your email for confirmation');
        }
        catch (error) {
            res.status(500).json({ error: 'Ups! Something went wrong' });
        }
    };
    static confirmAccount = async (req, res) => {
        try {
            const { token } = req.body;
            const tokenExists = await Token_1.default.findOne({ token });
            if (!tokenExists) {
                const error = new Error('Token not valid');
                res.status(404).json({ error: error.message });
                return;
            }
            const user = await User_1.default.findById(tokenExists.user);
            user.confirmed = true;
            await Promise.allSettled([user.save(), tokenExists.deleteOne()]);
            res.send('Account confirmed successfully');
        }
        catch (error) {
            res.status(500).json({ error: 'Oops! Something went wrong' });
        }
    };
    static login = async (req, res) => {
        try {
            const { email, password } = req.body;
            const user = await User_1.default.findOne({ email });
            if (!user) {
                const error = new Error('User not found');
                res.status(404).json({ error: error.message });
                return;
            }
            if (!user.confirmed) {
                const token = new Token_1.default();
                token.user = user.id;
                token.token = (0, token_1.generateToken)();
                await token.save();
                AuthEmail_1.AuthEmail.sendConfirmationEmail({
                    email: user.email,
                    name: user.name,
                    token: token.token,
                });
                const error = new Error('This account has not been confirmed, a confirmation link has been sent to your email');
                res.status(401).json({ error: error.message });
                return;
            }
            const isPasswordCorrect = await (0, auth_1.checkPassword)(password, user.password);
            if (!isPasswordCorrect) {
                const error = new Error('Incorrect Password');
                res.status(404).json({ error: error.message });
                return;
            }
            const token = (0, jwt_1.generateJwt)({ id: user.id });
            res.send(token);
        }
        catch (error) {
            res.status(500).json({ error: 'Oops! Something went wrong' });
        }
    };
    static requestConfirmationCode = async (req, res) => {
        try {
            const { email } = req.body;
            const user = await User_1.default.findOne({ email });
            if (!user) {
                const error = new Error('This user does not exist');
                res.status(409).json({ error: error.message });
                return;
            }
            if (user.confirmed) {
                const error = new Error('User already confirmed');
                res.status(403).json({ error: error.message });
                return;
            }
            const token = new Token_1.default();
            token.token = (0, token_1.generateToken)();
            token.user = user.id;
            AuthEmail_1.AuthEmail.sendConfirmationEmail({
                email: user.email,
                name: user.name,
                token: token.token,
            });
            await Promise.allSettled([user.save(), token.save()]);
            res.send('A new token has been sent to your email');
        }
        catch (error) {
            res.status(500).json({ error: 'Ups! Something went wrong' });
        }
    };
    static forgotPassword = async (req, res) => {
        try {
            const { email } = req.body;
            const user = await User_1.default.findOne({ email });
            if (!user) {
                const error = new Error('This user does not exist');
                res.status(409).json({ error: error.message });
                return;
            }
            const token = new Token_1.default();
            token.token = (0, token_1.generateToken)();
            token.user = user.id;
            await token.save();
            AuthEmail_1.AuthEmail.sendPasswordResetToken({
                email: user.email,
                name: user.name,
                token: token.token,
            });
            res.send('Please, check your email for further instructions');
        }
        catch (error) {
            res.status(500).json({ error: 'Ups! Something went wrong' });
        }
    };
    static validateToken = async (req, res) => {
        try {
            const { token } = req.body;
            const tokenExists = await Token_1.default.findOne({ token });
            if (!tokenExists) {
                const error = new Error('Token not valid');
                res.status(404).json({ error: error.message });
                return;
            }
            res.send('Token is valid, define a new password');
        }
        catch (error) {
            res.status(500).json({ error: 'Oops! Something went wrong' });
        }
    };
    static updatePasswordWithToken = async (req, res) => {
        try {
            const { token } = req.params;
            const { password } = req.body;
            const tokenExists = await Token_1.default.findOne({ token });
            if (!tokenExists) {
                const error = new Error('Token not valid');
                res.status(404).json({ error: error.message });
                return;
            }
            const user = await User_1.default.findById(tokenExists.user);
            user.password = await (0, auth_1.hashPassword)(password);
            await Promise.allSettled([user.save(), tokenExists.deleteOne()]);
            res.send('Password updated successfully');
        }
        catch (error) {
            res.status(500).json({ error: 'Oops! Something went wrong' });
        }
    };
    static user = async (req, res) => {
        res.json(req.user);
        return;
    };
    static updateProfile = async (req, res) => {
        const { name, email } = req.body;
        const userExists = await User_1.default.findOne({ email });
        if (userExists && userExists.id.toString() !== req.user.id.toString()) {
            const error = new Error('User already exists');
            res.status(409).json({ error: error.message });
            return;
        }
        req.user.name = name;
        req.user.email = email;
        try {
            await req.user.save();
            res.send('Profile updated successfully');
        }
        catch (error) {
            res.status(500).json({ error: 'Ups! Something went wrong' });
        }
    };
    static updateCurrentUserPassword = async (req, res) => {
        const { current_password, password } = req.body;
        const user = await User_1.default.findById(req.user.id);
        const isPasswordCorrect = await (0, auth_1.checkPassword)(current_password, user.password);
        if (!isPasswordCorrect) {
            const error = new Error('Incorrect Password');
            res.status(401).json({ error: error.message });
            return;
        }
        try {
            user.password = await (0, auth_1.hashPassword)(password);
            await user.save();
            res.send('Password updated successfully');
        }
        catch (error) {
            res.status(500).json({ error: 'Ups! Something went wrong' });
        }
    };
    static checkPassword = async (req, res) => {
        const { password } = req.body;
        const user = await User_1.default.findById(req.user.id);
        const isPasswordCorrect = await (0, auth_1.checkPassword)(password, user.password);
        if (!isPasswordCorrect) {
            const error = new Error('Incorrect Password');
            res.status(401).json({ error: error.message });
            return;
        }
        res.send('Password is correct');
    };
}
exports.AuthController = AuthController;
//# sourceMappingURL=AuthController.js.map