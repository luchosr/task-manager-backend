import { AuthEmail } from './../emails/AuthEmail';
import type { Request, Response } from 'express';
import User from '../models/User';
import { checkPassword, hashPassword } from '../utils/auth';
import Token from '../models/Token';
import { generateToken } from '../utils/token';
import { generateJwt } from '../utils/jwt';

export class AuthController {
  static createAccount = async (req: Request, res: Response) => {
    try {
      const { password, email } = req.body;

      const userExists = await User.findOne({ email });

      if (userExists) {
        const error = new Error('User already exists');
        res.status(409).json({ error: error.message });
        return;
      }

      const user = new User(req.body);
      user.password = await hashPassword(password);

      const token = new Token();
      token.token = generateToken();
      token.user = user.id;

      AuthEmail.sendConfirmationEmail({
        email: user.email,
        name: user.name,
        token: token.token,
      });

      await Promise.allSettled([user.save(), token.save()]);

      res.send('Account created, please check your email for confirmation');
    } catch (error) {
      res.status(500).json({ error: 'Ups! Something went wrong' });
    }
  };

  static confirmAccount = async (req: Request, res: Response) => {
    try {
      const { token } = req.body;
      const tokenExists = await Token.findOne({ token });
      if (!tokenExists) {
        const error = new Error('Token not valid');
        res.status(404).json({ error: error.message });
        return;
      }

      const user = await User.findById(tokenExists.user);
      user.confirmed = true;
      await Promise.allSettled([user.save(), tokenExists.deleteOne()]);

      res.send('Account confirmed successfully');
    } catch (error) {
      res.status(500).json({ error: 'Oops! Something went wrong' });
    }
  };

  static login = async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;
      const user = await User.findOne({ email });
      if (!user) {
        const error = new Error('User not found');
        res.status(404).json({ error: error.message });
        return;
      }

      if (!user.confirmed) {
        const token = new Token();
        token.user = user.id;
        token.token = generateToken();

        await token.save();

        AuthEmail.sendConfirmationEmail({
          email: user.email,
          name: user.name,
          token: token.token,
        });

        const error = new Error(
          'This account has not been confirmed, a confirmation link has been sent to your email'
        );
        res.status(401).json({ error: error.message });
        return;
      }
      const isPasswordCorrect = await checkPassword(password, user.password);

      if (!isPasswordCorrect) {
        const error = new Error('Incorrect Password');
        res.status(404).json({ error: error.message });
        return;
      }

      const token = generateJwt({ id: user.id });

      res.send(token);
    } catch (error) {
      res.status(500).json({ error: 'Oops! Something went wrong' });
    }
  };

  static requestConfirmationCode = async (req: Request, res: Response) => {
    try {
      const { email } = req.body;

      const user = await User.findOne({ email });

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

      const token = new Token();
      token.token = generateToken();
      token.user = user.id;

      AuthEmail.sendConfirmationEmail({
        email: user.email,
        name: user.name,
        token: token.token,
      });

      await Promise.allSettled([user.save(), token.save()]);

      res.send('A new token has been sent to your email');
    } catch (error) {
      res.status(500).json({ error: 'Ups! Something went wrong' });
    }
  };

  static forgotPassword = async (req: Request, res: Response) => {
    try {
      const { email } = req.body;

      const user = await User.findOne({ email });

      if (!user) {
        const error = new Error('This user does not exist');
        res.status(409).json({ error: error.message });
        return;
      }

      const token = new Token();
      token.token = generateToken();
      token.user = user.id;
      await token.save();

      AuthEmail.sendPasswordResetToken({
        email: user.email,
        name: user.name,
        token: token.token,
      });

      res.send('Please, check your email for further instructions');
    } catch (error) {
      res.status(500).json({ error: 'Ups! Something went wrong' });
    }
  };

  static validateToken = async (req: Request, res: Response) => {
    try {
      const { token } = req.body;
      const tokenExists = await Token.findOne({ token });
      if (!tokenExists) {
        const error = new Error('Token not valid');
        res.status(404).json({ error: error.message });
        return;
      }

      res.send('Token is valid, define a new password');
    } catch (error) {
      res.status(500).json({ error: 'Oops! Something went wrong' });
    }
  };

  static updatePasswordWithToken = async (req: Request, res: Response) => {
    try {
      const { token } = req.params;
      const { password } = req.body;
      const tokenExists = await Token.findOne({ token });
      if (!tokenExists) {
        const error = new Error('Token not valid');
        res.status(404).json({ error: error.message });
        return;
      }

      const user = await User.findById(tokenExists.user);
      user.password = await hashPassword(password);
      await Promise.allSettled([user.save(), tokenExists.deleteOne()]);

      res.send('Password updated successfully');
    } catch (error) {
      res.status(500).json({ error: 'Oops! Something went wrong' });
    }
  };

  static user = async (req: Request, res: Response) => {
    res.json(req.user);
    return;
  };

  static updateProfile = async (req: Request, res: Response) => {
    const { name, email } = req.body;

    const userExists = await User.findOne({ email });

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
    } catch (error) {
      res.status(500).json({ error: 'Ups! Something went wrong' });
    }
  };

  static updateCurrentUserPassword = async (req: Request, res: Response) => {
    const { current_password, password } = req.body;

    const user = await User.findById(req.user.id);

    const isPasswordCorrect = await checkPassword(
      current_password,
      user.password
    );

    if (!isPasswordCorrect) {
      const error = new Error('Incorrect Password');
      res.status(401).json({ error: error.message });
      return;
    }

    try {
      user.password = await hashPassword(password);
      await user.save();

      res.send('Password updated successfully');
    } catch (error) {
      res.status(500).json({ error: 'Ups! Something went wrong' });
    }
  };

  static checkPassword = async (req: Request, res: Response) => {
    const { password } = req.body;

    const user = await User.findById(req.user.id);

    const isPasswordCorrect = await checkPassword(password, user.password);

    if (!isPasswordCorrect) {
      const error = new Error('Incorrect Password');
      res.status(401).json({ error: error.message });
      return;
    }

    res.send('Password is correct');
  };
}
