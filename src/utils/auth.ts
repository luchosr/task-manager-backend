import bcrypt from 'bcrypt';

export const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

export const checkPassword = async (
  password: string,
  storedHash: string
): Promise<boolean> => {
  return bcrypt.compare(password, storedHash);
};
