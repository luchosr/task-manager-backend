"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthEmail = void 0;
const nodemailer_1 = require("../config/nodemailer");
class AuthEmail {
    static sendConfirmationEmail = async (user) => {
        const info = await nodemailer_1.transporter.sendMail({
            from: 'UpTask Manager <pC5pR@example.com>',
            to: user.email,
            subject: 'Confirm your account',
            text: `Please click on the following link to confirm your account: `,
            html: `<p>User: ${user.name} has created an account, please add 
       the following token to confirm your account: ${user.token}</p>
       or you can click the following link: <a href="${process.env.FRONTEND_URL}/auth/confirm-account">Confirm Account</a>
      <p>This link will expire in 10 minutes</p>`,
        });
        console.log('Email sent', info.messageId);
    };
    static sendPasswordResetToken = async (user) => {
        const info = await nodemailer_1.transporter.sendMail({
            from: 'UpTask Manager <pC5pR@example.com>',
            to: user.email,
            subject: 'Reset your password',
            text: `Please click on the following link to reset your password: `,
            html: `<p>User: ${user.name}, please add 
       the following token to confirm your password reset: ${user.token}</p>
       or you can click the following link: <a href="${process.env.FRONTEND_URL}/auth/new-password">Reset Password</a>
      <p>This link will expire in 10 minutes</p>`,
        });
        console.log('Email sent', info.messageId);
    };
}
exports.AuthEmail = AuthEmail;
//# sourceMappingURL=AuthEmail.js.map