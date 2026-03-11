import { rootConfig } from '@/configs/const.config';
import 'dotenv/config';
import 'reflect-metadata';
import { DataSource } from 'typeorm';
export const AppDataSource = new DataSource({
  type: 'mysql',
  host: rootConfig.DB_HOST,
  port: Number(rootConfig.DB_PORT),
  username: rootConfig.DB_USERNAME,
  password: rootConfig.DB_PASSWORD,
  database: rootConfig.DB_NAME,
  entities: ['src/**/*.entity.ts'],
  migrations: ['src/database/migrations/*.ts'],
  synchronize: false,
  logging: false,
});
