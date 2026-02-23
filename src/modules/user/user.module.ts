import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '@/database/entities/user.entity';
import { AuthModule } from '../auth/auth.module';
import { OrganizationModule } from '../organization/organization.module';

@Module({
  imports: [TypeOrmModule.forFeature([User]), AuthModule, OrganizationModule],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
