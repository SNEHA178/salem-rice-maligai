import dotenv from 'dotenv';
dotenv.config();

export const getJwtSecret = (): string => {
  return process.env.JWT_SECRET || 'salem_rice_maligai_jwt_secret_key_2026_secure';
};

export const JWT_SECRET = getJwtSecret();
