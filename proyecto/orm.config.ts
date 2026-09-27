import { config } from 'dotenv';
import { DataSource } from 'typeorm';

config({
  path: `.env`,
  // sin override: true — así las env vars de Render tienen prioridad
});

export default new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '3306', 10),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,

  ssl: {
    rejectUnauthorized: false,
  },

  entities: [__dirname + '/src/**/*.entity.ts'],
  migrations: [__dirname + '/src/migrations/*{.ts,.js}'],

  synchronize: false,
  logging: true,
});