import 'dotenv/config';
export const rootConfig = {
  PORT: process.env.PORT || 3000,
  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET || 'defaultAccessSecret',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'defaultRefreshSecret',
  JWT_ACCESS_EXPIRES_IN: process.env.JWT_ACCESS_EXPIRES_IN ?? 900,
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN ?? 10080,
  FRONTENT_URL: process.env.FRONTENT_URL || 'http://localhost:3001',
};
