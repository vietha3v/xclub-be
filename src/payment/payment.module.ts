import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Payment } from './entities/payment.entity';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { UserModule } from '../user/user.module';
import { ClubModule } from '../club/club.module';
import { EventModule } from '../event/event.module';
import { RaceModule } from '../race/race.module';
import { ChallengeModule } from '../challenge/challenge.module';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Payment]),
    UserModule,
    ClubModule,
    EventModule,
    RaceModule,
    ChallengeModule,
    NotificationModule,
  ],
  controllers: [PaymentController],
  providers: [PaymentService],
  exports: [PaymentService],
})
export class PaymentModule {}
