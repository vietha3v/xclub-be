import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClubController } from './club.controller';
import { ClubService } from './club.service';
import { ClubMemberController } from './controllers/club-member.controller';
import { ClubMemberService } from './services/club-member.service';
import { ClubPermissionService } from './services/club-permission.service';
import { Club } from './entities/club.entity';
import { ClubMember } from './entities/club-member.entity';
import { Event } from '../event/entities/event.entity';
import { Challenge } from '../challenge/entities/challenge.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Club, ClubMember, Event, Challenge])],
  controllers: [ClubController, ClubMemberController],
  providers: [ClubService, ClubMemberService, ClubPermissionService],
  exports: [ClubService, ClubMemberService, ClubPermissionService],
})
export class ClubModule {}
