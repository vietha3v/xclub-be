import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

export const getDatabaseConfig = (configService: ConfigService): TypeOrmModuleOptions => ({
  type: 'postgres',
  host: configService.get<string>('DB_HOST', 'localhost'),
  port: configService.get<number>('DB_PORT', 5432),
  username: configService.get<string>('DB_USERNAME', 'postgres'),
  password: configService.get<string>('DB_PASSWORD', 'password'),
  database: configService.get<string>('DB_DATABASE', 'xclub_db'),
  
  // Entities
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  
  // Migrations
  migrations: [__dirname + '/../database/migrations/*{.ts,.js}'],
  migrationsRun: configService.get<boolean>('DB_MIGRATIONS_RUN', false),
  migrationsTableName: 'migrations',
  
  // Synchronization (chỉ dùng trong development)
  synchronize: configService.get<boolean>('DB_SYNCHRONIZE', false),
  
  // Logging
  logging: configService.get<boolean>('DB_LOGGING', false),
  logger: 'advanced-console',
  
  // Connection options
  extra: {
    connectionLimit: configService.get<number>('DB_CONNECTION_LIMIT', 10),
    acquireTimeout: configService.get<number>('DB_ACQUIRE_TIMEOUT', 60000),
    timeout: configService.get<number>('DB_TIMEOUT', 60000),
  },
  
  // SSL (production)
  ssl: configService.get<string>('NODE_ENV') === 'production' 
    ? { rejectUnauthorized: false } 
    : false,
  
  // Auto load entities
  autoLoadEntities: true,
  
  // Keep connection alive
  keepConnectionAlive: true,
});
