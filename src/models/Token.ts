import mongoose, { Schema, Document, Types } from 'mongoose';

interface IToken extends Document {
  token: string;
  user: Types.ObjectId;
  createdAt: string;
}

const tokenSchema: Schema = new Schema({
  token: { type: String, required: true },
  user: { type: Types.ObjectId, ref: 'User', required: true },
  expiresAt: { type: Date, default: Date.now(), expires: '10m' },
});

const Token = mongoose.model<IToken>('Token', tokenSchema);

export default Token;
