import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Integration } from './entities/integration.entity';
import { UserIntegration } from './entities/user-integration.entity';
import { Activity } from '../activity/entities/activity.entity';
import { IntegrationService } from './integration.service';
import { IntegrationController } from './integration.controller';
import { SyncActivityService } from './services/sync-activity.service';
import { SyncActivityController } from './controllers/sync-activity.controller';
import { UserModule } from '../user/user.module';
import { ClubModule } from '../club/club.module';
import { ActivityModule } from '../activity/activity.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Integration, UserIntegration, Activity]),
    UserModule,
    ClubModule,
    ActivityModule,
  ],
  controllers: [IntegrationController, SyncActivityController],
  providers: [IntegrationService, SyncActivityService],
  exports: [IntegrationService, SyncActivityService],
})
export class IntegrationModule {}