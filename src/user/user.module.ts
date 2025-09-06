import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { User } from './entities/user.entity';
import { UserSettings } from './entities/user-settings.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, UserSettings])],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService], // Export để Auth module có thể sử dụng
})
export class UserModule {}
