import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventController } from './event.controller';
import { EventService } from './event.service';
import { Event } from './entities/event.entity';
import { Club } from '../club/entities/club.entity';
import { ClubModule } from '../club/club.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Event, Club]),
    ClubModule, // Import ClubModule để sử dụng ClubPermissionService
  ],
  controllers: [EventController],
  providers: [EventService],
  exports: [EventService],
})
export class EventModule {}
