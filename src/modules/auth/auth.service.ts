import { BadRequestException, Injectable } from '@nestjs/common';
import { SignInDto } from './dto/singIn.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '@/database/entities/user.entity';
import { DataSource, EntityManager, In, Repository } from 'typeorm';
import { SignUpDto } from './dto/signUp.dto';
import { JwtService } from '@nestjs/jwt';
import { PayloadToken } from '@/common/types/payloadToken.type';
import { userStatus } from '@/common/enum/user.enum';
import { rootConfig } from '@/configs/const.config';
import { RefreshTokenDto } from './dto/refreshToken.dto';
import { OrganizationMember } from '@/database/entities/organizationMember.entity';
import * as bcrypt from 'bcrypt';
import { Organization } from '@/database/entities/organization.entity';
import { validateUserResponse } from '@/common/utils/user.util';
import { OrganizationMemberRole } from '@/common/enum/organization.enum';
import { ForgotPasswordDto } from './dto/forgotPassword.dto';
import { PasswordReset } from '@/database/entities/passwordReset.entity';
import { v7 as uuidv7 } from 'uuid';
import { InjectQueue } from '@nestjs/bull';
import { QueueName } from '../queues/queue.const';
import { Queue } from 'bull';
import { ResetPasswordDto } from './dto/resetPassword.dto';
@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Organization)
    private readonly organizationRepo: Repository<Organization>,
    @InjectRepository(PasswordReset)
    private readonly passwordResetRepo: Repository<PasswordReset>,
    @InjectQueue(QueueName.MAIL_QUEUE) private readonly mailQueue: Queue,
    private readonly jwtService: JwtService,
    private readonly dataSource: DataSource,
  ) {}

  public async getProfileinfoUser({
    userId,
    email,
  }: { userId?: number; email?: string } = {}) {
    const whereConditions: any = {};
    if (userId) {
      whereConditions.id = userId;
    }
    if (email) {
      whereConditions.email = email;
    }
    return await this.userRepo
      .createQueryBuilder('user')
      .leftJoin('user.avatar', 'avatar')
      .leftJoin('user.organizationMemberships', 'member')
      .leftJoin('member.organization', 'org')
      .where(whereConditions)
      .andWhere('user.status = :status', { status: userStatus.ACTIVE })

      // USER
      .select([
        'user.id',
        'user.email',
        'user.fullName',
        'user.dateOfBirth',
        'user.systemRole',
        'user.password',
      ])

      // AVATAR
      .addSelect(['avatar.id', 'avatar.url'])

      // ORGANIZATION MEMBERSHIP
      .addSelect(['member.id', 'member.role'])

      // ORGANIZATION
      .addSelect(['org.id', 'org.name'])
      .distinct(true)

      .getOne();
  }

  // Sign In
  async signIn(data: SignInDto) {
    const { email, password } = data;
    const user = await this.getProfileinfoUser({ email });

    if (!user) {
      throw new BadRequestException('Invalid credentials');
    }
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw new BadRequestException('Invalid credentials');
    }
    const tokens = await this.generateTokens(user);
    return {
      tokens,
      user: validateUserResponse(user),
    };
  }

  logout(userId: number) {
    return { message: `Logout successful by ${userId}` };
  }
  async forgotPassword(data: ForgotPasswordDto) {
    const { email } = data;
    const checkEmailExits = await this.userRepo.findOne({ where: { email } });
    if (!checkEmailExits) {
      throw new BadRequestException('Email not found');
    }
    const resetToken = uuidv7();
    void this.passwordResetRepo.save({
      email,
      token: resetToken,
      expiresAt: new Date(Date.now() + 3600000), // 1 hour expiration
    });
    await this.mailQueue.add(
      QueueName.FORGOT_PASSWORD_JOB,
      {
        email,
        token: resetToken,
      },
      {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 5000, // 5 seconds
        },
      },
    );

    return { message: 'Password reset link sent successfully' };
  }
  async resetPassword(data: ResetPasswordDto) {
    const { token, newPassword } = data;
    const passwordReset = await this.passwordResetRepo.findOne({
      where: { token },
    });
    if (!passwordReset || passwordReset.expiresAt < new Date()) {
      throw new BadRequestException('Invalid or expired token');
    }
    const user = await this.userRepo.findOne({
      where: { email: passwordReset.email },
    });
    if (!user) {
      throw new BadRequestException('User not found');
    }
    user.password = await bcrypt.hash(newPassword, 10);
    await this.userRepo.save(user);
    await this.passwordResetRepo.delete({ id: passwordReset.id });
    return { message: 'Password reset successful' };
  }
  // Refresh Tokens
  async refreshTokens(data: RefreshTokenDto) {
    try {
      const { refreshToken } = data;
      const payload = await this.jwtService.verifyAsync<PayloadToken>(
        refreshToken,
        {
          secret: rootConfig.JWT_REFRESH_SECRET,
        },
      );
      const user = await this.userRepo.findOne({
        where: { id: payload.sub, status: userStatus.ACTIVE },
      });
      if (!user) {
        throw new BadRequestException('Invalid refresh token');
      }
      const tokens = await this.generateTokens(user);
      return {
        tokens,
      };
    } catch {
      throw new BadRequestException('Invalid refresh token');
    }
  }

  // profilr
  async getProfile(userId: number) {
    const user = await this.getProfileinfoUser({ userId });
    if (!user) {
      throw new BadRequestException('User not found');
    }

    return validateUserResponse(user);
  }

  public async checkEmailExistInOrganization({
    userId,
    organizationIds,
  }: {
    userId: number;
    organizationIds: number[];
  }): Promise<boolean> {
    const count = await this.userRepo
      .createQueryBuilder('user')
      .innerJoin('user.organizationMemberships', 'orgMember')
      .where('user.id = :userId', { userId })
      .andWhere('orgMember.organization_id IN (:...organizationIds)', {
        organizationIds,
      })
      .getCount();
    return count > 0;
  }

  async signUp(data: SignUpDto) {
    const { email, fullName, password, dateOfBirth, organizations } = data;

    return this.dataSource.transaction(async (manager) => {
      // Validate organizations
      const organizationIds = organizations.map((o) => o.id);
      await this.validateOrganizations(organizationIds);

      // Create or fetch user
      const user = await this.createOrFetchUser(manager, {
        email,
        fullName,
        password,
        dateOfBirth,
      });
      // Check if email exists in any organization
      await this.ensureEmailNotInOrganizations(user.id, organizationIds);

      // Add user to organizations
      await this.addUserToOrganizations(manager, user, organizations);

      return user;
    });
  }

  private async validateOrganizations(organizationIds: number[]) {
    const existOrganizations = await this.organizationRepo.find({
      where: { id: In(organizationIds) },
      select: ['id'],
    });

    const existIds = new Set(existOrganizations.map((o) => o.id));
    const notFoundId = organizationIds.find((id) => !existIds.has(id));

    if (notFoundId) {
      throw new BadRequestException(
        `Organization with ID ${notFoundId} not found`,
      );
    }
  }

  private async createOrFetchUser(
    manager: EntityManager,
    {
      email,
      fullName,
      password,
      dateOfBirth,
    }: {
      email: string;
      fullName: string;
      password: string;
      dateOfBirth: Date;
    },
  ): Promise<User> {
    const hashPassword = await bcrypt.hash(password, 10);
    let user = await this.userRepo.findOne({
      where: { email },
      withDeleted: true,
    });
    if (user && user.deletedAt) {
      await manager.save(User, {
        ...user,
        deletedAt: null,
        email: email,
        fullName: fullName,
        dateOfBirth: dateOfBirth,
        password: hashPassword,
        status: userStatus.ACTIVE,
        organizationMemberships: [],
      });
    }
    if (!user) {
      user = await manager.save(User, {
        email,
        fullName,
        password: hashPassword,
        dateOfBirth,
      });
    }
    return user;
  }

  private async ensureEmailNotInOrganizations(
    userId: number,
    organizationIds: number[],
  ) {
    const isEmailExistInOrg = await this.checkEmailExistInOrganization({
      userId,
      organizationIds,
    });
    if (isEmailExistInOrg) {
      throw new BadRequestException('Email already exists in the organization');
    }
  }

  async addUserToOrganizations(
    manager: EntityManager,
    user: User,
    organizations: { id: number; organizationRole: OrganizationMemberRole }[],
  ) {
    for (const org of organizations) {
      if (
        !Object.values(OrganizationMemberRole).includes(org.organizationRole)
      ) {
        throw new BadRequestException(
          `Invalid organization role: ${org.organizationRole}`,
        );
      }

      await manager.save(OrganizationMember, {
        user,
        organization: { id: org.id } as Organization,
        role: org.organizationRole,
      });
    }
  }

  private async generateTokens(user: User) {
    const payload: PayloadToken = {
      sub: user.id,
      email: user.email,
      systemRole: user.systemRole,
    };

    const accessToken = await this.jwtService.signAsync(payload, {
      expiresIn: Number(rootConfig.JWT_ACCESS_EXPIRES_IN),
      secret: rootConfig.JWT_ACCESS_SECRET,
    });

    const refreshToken = await this.jwtService.signAsync(payload, {
      expiresIn: Number(rootConfig.JWT_REFRESH_EXPIRES_IN),
      secret: rootConfig.JWT_REFRESH_SECRET,
    });

    return {
      accessToken,
      refreshToken,
    };
  }
}
