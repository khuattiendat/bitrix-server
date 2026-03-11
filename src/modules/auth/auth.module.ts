import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '@/database/entities/user.entity';
import { JwtAccessStrategy } from './strategies/jwt-access.strategy';
import { JwtRefreshStrategy } from './strategies/jwt-refresh.strategy';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { JwtModule } from '@nestjs/jwt';
import 'dotenv/config';
import { rootConfig } from '@/configs/const.config';
import { RolesSystemGuard } from '@/common/guards/roles.guard';
import { OrganizationMember } from '@/database/entities/organizationMember.entity';
import { Organization } from '@/database/entities/organization.entity';
import { PasswordReset } from '@/database/entities/passwordReset.entity';
import { MailModule } from '../mail/mail.module';
@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      OrganizationMember,
      Organization,
      PasswordReset,
    ]),
    JwtModule.register({
      secret: rootConfig.JWT_ACCESS_SECRET,
      signOptions: {
        expiresIn: rootConfig.JWT_ACCESS_EXPIRES_IN as number,
      },
    }),
    MailModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtAccessStrategy,
    JwtRefreshStrategy,
    JwtAuthGuard,
    RolesSystemGuard,
  ],
  exports: [AuthService],
})
export class AuthModule {}
