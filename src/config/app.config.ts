export const appConfig = {
  // Application
  port: parseInt(process.env.PORT || '3001', 10),
  apiPrefix: process.env.API_PREFIX || 'api/v1',
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // CORS Configuration
  cors: {
    origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000', 'http://localhost:3001'],
    credentials: process.env.CORS_CREDENTIALS === 'true',
    methods: process.env.CORS_METHODS?.split(',') || ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: process.env.CORS_ALLOWED_HEADERS?.split(',') || [
      'Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization', 'X-API-Key'
    ],
    exposedHeaders: process.env.CORS_EXPOSED_HEADERS?.split(',') || ['X-Total-Count', 'X-Page-Count'],
    maxAge: parseInt(process.env.CORS_MAX_AGE || '86400', 10),
  },
  
  // Database Configuration
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_DATABASE || 'xclub_db',
    synchronize: process.env.DB_SYNCHRONIZE === 'true',
    logging: process.env.DB_LOGGING === 'true',
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  },
  
  // JWT Configuration
  jwt: {
    secret: process.env.JWT_SECRET || 'your_super_secret_jwt_key_here_change_in_production',
    expiresIn: process.env.JWT_EXPIRES_IN || '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    issuer: process.env.JWT_ISSUER || 'x-club-backend',
    audience: process.env.JWT_AUDIENCE || 'x-club-frontend',
  },
  
  // Rate Limiting
  rateLimit: {
    ttl: parseInt(process.env.RATE_LIMIT_TTL || '60', 10),
    limit: parseInt(process.env.RATE_LIMIT_LIMIT || '100', 10),
  },
  
  // Security
  security: {
    bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS || '10', 10),
    helmetEnabled: process.env.HELMET_ENABLED === 'true',
    compressionEnabled: process.env.COMPRESSION_ENABLED === 'true',
  },
  
  // Logging
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    enableRequestLogging: process.env.ENABLE_REQUEST_LOGGING === 'true',
    enableDbLogging: process.env.ENABLE_DB_LOGGING === 'true',
    filePath: process.env.LOG_FILE_PATH || './logs',
    // Request/Response Logging
    requestLogging: {
      enabled: process.env.ENABLE_REQUEST_LOGGING === 'true',
      logHeaders: process.env.LOG_REQUEST_HEADERS === 'true',
      logBody: process.env.LOG_REQUEST_BODY === 'true',
      logResponse: process.env.LOG_RESPONSE === 'true',
      logDuration: process.env.LOG_REQUEST_DURATION === 'true',
      excludePaths: process.env.LOG_EXCLUDE_PATHS?.split(',') || ['/health', '/metrics'],
    },
    // Database Logging
    databaseLogging: {
      enabled: process.env.ENABLE_DB_LOGGING === 'true',
      logQueries: process.env.LOG_DB_QUERIES === 'true',
      logParameters: process.env.LOG_DB_PARAMETERS === 'true',
      logSlowQueries: process.env.LOG_SLOW_QUERIES === 'true',
      slowQueryThreshold: parseInt(process.env.SLOW_QUERY_THRESHOLD || '1000', 10), // ms
      logConnections: process.env.LOG_DB_CONNECTIONS === 'true',
      logErrors: process.env.LOG_DB_ERRORS === 'true',
    },
    // File Logging
    fileLogging: {
      enabled: process.env.ENABLE_FILE_LOGGING === 'true',
      maxSize: process.env.LOG_MAX_SIZE || '20m',
      maxFiles: process.env.LOG_MAX_FILES || '14d',
      logLevel: process.env.FILE_LOG_LEVEL || 'info',
    },
  },
  
  // Swagger
  swagger: {
    enabled: process.env.SWAGGER_ENABLED === 'true',
    title: process.env.SWAGGER_TITLE || 'X-Club API',
    description: process.env.SWAGGER_DESCRIPTION || 'Tài liệu API Backend X-Club - Hệ thống quản lý câu lạc bộ chạy bộ',
    version: process.env.SWAGGER_VERSION || '1.0',
    path: process.env.SWAGGER_PATH || 'api',
  },
  
  // File Upload
  upload: {
    maxSize: parseInt(process.env.UPLOAD_MAX_SIZE || '10485760', 10),
    dest: process.env.UPLOAD_DEST || './uploads',
    acceptedTypes: process.env.UPLOAD_ACCEPTED_TYPES?.split(',') || ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  },
  
  // Redis
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD || '',
    db: parseInt(process.env.REDIS_DB || '0', 10),
    ttl: parseInt(process.env.REDIS_TTL || '3600', 10),
  },
  
  // Email
  email: {
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT || '587', 10),
    secure: process.env.EMAIL_SECURE === 'true',
    user: process.env.EMAIL_USER || 'your_email@gmail.com',
    password: process.env.EMAIL_PASSWORD || 'your_app_password',
    from: process.env.EMAIL_FROM || 'noreply@x-club.com',
  },
};
