import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import compression from 'compression';


async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  
  // Security middleware
  app.use(helmet());
  app.use(compression());
  
  // CORS Configuration - Sử dụng ConfigService
  const corsConfig = {
    origin: configService.get('CORS_ORIGIN', '*'),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  };
  app.enableCors(corsConfig);

  // Request/Response Logging Middleware - Sử dụng ConfigService
  if (configService.get('ENABLE_REQUEST_LOGGING') === 'true') {
    const { LoggingMiddleware } = require('./common/middleware/logging.middleware');
    app.use(new LoggingMiddleware().use);
  }

  // Global prefix
  app.setGlobalPrefix(configService.get('API_PREFIX', 'api'));
  
  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );
  
  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('X-Club API')
    .setDescription('Tài liệu API Backend X-Club - Hệ thống quản lý câu lạc bộ chạy bộ')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Nhập JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    // .addTag('auth', '🔐 Xác thực & Đăng nhập')
    // .addTag('users', '👤 Quản lý người dùng')
    // .addTag('activities', '🏃‍♂️ Ghi nhận hoạt động')
    // .addTag('clubs', '🏢 Quản lý câu lạc bộ')
    // .addTag('challenges', '🎯 Quản lý thử thách')
    // .addTag('events', '📅 Quản lý sự kiện')
    // .addTag('races', '🏁 Quản lý giải chạy')
    // .addTag('achievements', '🏆 Quản lý thành tích')
    // .addTag('training', '📚 Kế hoạch tập luyện')
    // .addTag('goals', '🎯 Quản lý mục tiêu')
    // .addTag('friends', '👥 Quản lý bạn bè')
    // .addTag('ai-assistant', '🤖 Trợ lý AI')
    // .addTag('settings', '⚙️ Cài đặt người dùng')
    // .addTag('integration', '🔗 Tích hợp bên thứ 3')
    // .addTag('pricing', '💰 Quản lý giá & Đăng ký')
    // .addTag('admin', '👨‍💼 Quản trị hệ thống')
    // .addTag('dashboard', '📊 Bảng điều khiển')
    // .addTag('notifications', '🔔 Hệ thống thông báo')
    // .addTag('analytics', '📈 Phân tích dữ liệu')
    // .addTag('payments', '💳 Hệ thống thanh toán')
    // .addTag('social', '🌐 Mạng xã hội')
    // .addTag('media', '📁 Quản lý tài nguyên')
    // .addTag('messaging', '💬 Hệ thống tin nhắn')
    // .addTag('gamification', '🎮 Hệ thống game hóa')
    // .addTag('health', '❤️ Theo dõi sức khỏe')
    // .addTag('reports', '📋 Báo cáo & Thống kê')
    // .addTag('security', '🔒 Bảo mật & Bảo vệ')
    // .addTag('system', '⚙️ Quản lý hệ thống')
    // .addTag('backup', '💾 Sao lưu & Khôi phục')
    // .addTag('monitoring', '📊 Giám sát & Theo dõi')
    // .addTag('testing', '🧪 Kiểm thử & Chất lượng')
    .build();
    
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });
  
  // Start application
  const port = configService.get('PORT', 3001);
  await app.listen(port);
  
  console.log(`🚀 Ứng dụng đang chạy tại: http://localhost:${port}`);
  console.log(`📚 Tài liệu Swagger: http://localhost:${port}/api`);
}

bootstrap();
