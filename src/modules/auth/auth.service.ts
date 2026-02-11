import { BadRequestException, Injectable } from '@nestjs/common';
import { SignInDto } from './dto/singIn.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '@/database/entities/user.entity';
import { DataSource, In, Repository } from 'typeorm';
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
@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Organization)
    private readonly organizationRepo: Repository<Organization>,
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
    } catch (error) {
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
    organizationId,
  }: {
    userId: number;
    organizationId: number;
  }): Promise<boolean> {
    const count = await this.userRepo
      .createQueryBuilder('user')
      .innerJoin('user.organizationMemberships', 'orgMember')
      .where('user.id = :userId', { userId })
      .andWhere('orgMember.organization_id = :organizationId', {
        organizationId,
      })
      .getCount();
    return count > 0;
  }

  async signUp(data: SignUpDto) {
    const { email, fullName, password, dateOfBirth, organizations } = data;
    return this.dataSource.transaction(async (manager) => {
      // Check organization tồn tại
      const organizationIds = organizations.map((o) => o.id);
      const existOrganizations = await this.organizationRepo.find({
        where: { id: In(organizationIds) },
  select: ['id'],
});

const existIds = new Set(existOrganizations.map(o => o.id));

const notFoundId = organizationIds.find(id => !existIds.has(id));

if (notFoundId) {
  throw new BadRequestException(
    `Organization with ID ${notFoundId} not found`,
  );
}

      // Lấy hoặc tạo user
      let user = await this.userRepo.findOne({ where: { email } });
      if (!user) {
        const hashPassword = await bcrypt.hash(password, 10);
        user = await manager.save(User, {
          email,
          full_name: fullName,
          password: hashPassword,
          dateOfBirth: dateOfBirth,
        });
      }
      // Check email tồn tại trong organization
      const isEmailExistInOrg = await this.checkEmailExistInOrganization({
        userId: user.id,
        organizationId,
      });
      if (isEmailExistInOrg) {
        throw new BadRequestException(
          'Email already exists in the organization',
        );
      }

      // Tạo organization member
      await manager.save(OrganizationMember, {
        user,
        organization,
        role: orgnazitionRole,
      });

      //  Return kết quả
      return user;
    });
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
