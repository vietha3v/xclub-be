import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ActivityController } from './activity.controller';
import { ActivityService } from './activity.service';
import { Activity } from './entities/activity.entity';
import { ActivityStats } from './entities/activity-stats.entity';
import { UserIntegration } from '../integration/entities/user-integration.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Activity, ActivityStats, UserIntegration])],
  controllers: [ActivityController],
  providers: [ActivityService],
  exports: [ActivityService],
})
export class ActivityModule {}
