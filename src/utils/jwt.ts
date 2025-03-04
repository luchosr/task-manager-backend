import jwt from 'jsonwebtoken';
import { Types } from 'mongoose';

type UserPayload = {
  id: Types.ObjectId;
};
export const generateJwt = (payload: UserPayload) => {
  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: '180d',
  });
  return token;
};
