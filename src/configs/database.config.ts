import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import 'dotenv/config';
import { rootConfig } from './const.config';

export const typeOrmOptions: TypeOrmModuleOptions = {
  type: 'mysql',
  host: rootConfig.DB_HOST,
  port: Number(rootConfig.DB_PORT || 3306),
  username: rootConfig.DB_USERNAME || 'root',
  password: rootConfig.DB_PASSWORD || '',
  database: rootConfig.DB_NAME,
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  synchronize: false,
  logging: false,
};
