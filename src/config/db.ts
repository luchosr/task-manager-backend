import mongoose from 'mongoose';
import colors from 'colors';
import { exit } from 'node:process';

export const connectDB = async () => {
  try {
    const connection = await mongoose.connect(process.env.DATABASE_URL);
    console.log(
      colors.magenta.bold(`MongoDB Connected: ${connection.connection.host}`)
    );
  } catch (error) {
    console.log(colors.bgRed(`MongoDB Connection Error: ${error}`));
    exit(1);
  }
};
