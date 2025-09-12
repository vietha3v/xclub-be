import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { ActivityModule } from './activity/activity.module';
import { ClubModule } from './club/club.module';
import { ChallengeModule } from './challenge/challenge.module';
import { EventModule } from './event/event.module';
import { RaceModule } from './race/race.module';
import { AchievementModule } from './achievement/achievement.module';
import { IntegrationModule } from './integration/integration.module';
import { NotificationModule } from './notification/notification.module';
import { PaymentModule } from './payment/payment.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { SocialModule } from './social/social.module';
import { MediaModule } from './media/media.module';
import { MedalTemplateModule } from './medal-template/medal-template.module';
import { CertificateTemplateModule } from './certificate-template/certificate-template.module';
import { ChallengeCategoryModule } from './challenge-category/challenge-category.module';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    
    // Database
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST', 'localhost'),
        port: configService.get('DB_PORT', 5432),
        username: configService.get('DB_USERNAME', 'postgres'),
        password: configService.get('DB_PASSWORD', '123456'),
        database: configService.get('DB_DATABASE', 'xclub_db'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: true,
        logging: configService.get('DB_LOGGING', 'false') === 'true',
        ssl: configService.get('NODE_ENV') === 'production' ? { rejectUnauthorized: false } : false,
      }),
      inject: [ConfigService],
    }),
    
    // Rate limiting
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        throttlers: [{
          ttl: configService.get('RATE_LIMIT_TTL', 60),
          limit: configService.get('RATE_LIMIT_LIMIT', 100),
        }],
      }),
      inject: [ConfigService],
    }),
    
    // Application modules
    UserModule,
    AuthModule,
    ActivityModule,
    ClubModule,
    ChallengeModule,
                    EventModule,
                                RaceModule,
                                AchievementModule,
                                IntegrationModule,
                                NotificationModule,
                                PaymentModule,
                                AnalyticsModule,
                SocialModule,
                MediaModule,
                MedalTemplateModule,
                CertificateTemplateModule,
                ChallengeCategoryModule,
  ],
})
export class AppModule {}
