import { BadRequestException, Injectable } from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '@/database/entities/user.entity';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { PaginationDto } from '@/common/dto/pagination.dto';
import { paginate } from '@/common/utils/paginate';
import { USER_SORTABLE_FIELDS } from '@/common/constants/user.const';
import { AuthService } from '../auth/auth.service';
import { validateUserResponse } from '@/common/utils/user.util';
import { OrganizationService } from '../organization/organization.service';
import * as bcrypt from 'bcrypt';
import { UserRole, userStatus } from '@/common/enum/user.enum';
@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly authService: AuthService,
    private readonly orgService: OrganizationService,
    private readonly dataSource: DataSource,
  ) {}

  async findAll(query: PaginationDto) {
    const {
      page = 1,
      limit = 10,
      search,
      sortBy = 'createdAt',
      order = 'DESC',
    } = query;

    const qb = this.userRepo
      .createQueryBuilder('user')
      .leftJoin('user.avatar', 'avatar')
      .leftJoin('user.organizationMemberships', 'member')
      .leftJoin('member.organization', 'org')
      .select([
        'user.id',
        'user.email',
        'user.fullName',
        'user.dateOfBirth',
        'user.systemRole',
        'user.status',
        'user.createdAt',
      ])
      .andWhere('user.systemRole != :systemRole', {
        systemRole: UserRole.ADMIN,
      })
      .addSelect(['avatar.id', 'avatar.url'])
      .addSelect(['member.id', 'member.role'])
      .addSelect(['org.id', 'org.name']);

    if (search?.trim()) {
      qb.andWhere('(user.email LIKE :keyword OR user.fullName LIKE :keyword)', {
        keyword: `%${search.trim()}%`,
      });
    }

    if (USER_SORTABLE_FIELDS.includes(sortBy)) {
      qb.orderBy(`user.${sortBy}`, order);
    } else {
      qb.orderBy('user.createdAt', 'DESC');
    }

    const { data, meta } = await paginate(qb, page, limit);
    const dataValidated = data.map((item) => {
      return validateUserResponse(item as unknown as User);
    });
    return {
      data: dataValidated,
      meta,
    };
  }

  async findOne(id: number) {
    const userDetail = await this.authService.getProfileinfoUser({
      userId: id,
    });
    if (!userDetail) {
      throw new BadRequestException('User not found');
    }
    return validateUserResponse(userDetail);
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const { dateOfBirth, fullName, email, organizations, password } =
      updateUserDto;
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) {
      throw new BadRequestException('User not found');
    }
    const emailExist = await this.userRepo.findOne({ where: { email } });
    if (emailExist && emailExist.id !== id) {
      throw new BadRequestException('Email already exists');
    }
    let hashPassword = null;
    if (password) {
      hashPassword = await bcrypt.hash(password, 10);
    }
    // upodate user info
    await this.userRepo.update(id, {
      ...user,
      dateOfBirth: dateOfBirth ?? user.dateOfBirth,
      fullName: fullName ?? user.fullName,
      email: email ?? user.email,
      password: hashPassword ?? user.password,
    });
    // update user organization
    if (organizations) {
      await this.dataSource.transaction(async (manager: EntityManager) => {
        await this.orgService.removeUserFromAllOrganizations(manager, id);
        await this.authService.addUserToOrganizations(
          manager,
          user,
          organizations,
        );
      });
    }
    const userDetail = await this.authService.getProfileinfoUser({
      userId: id,
    });

    return validateUserResponse(userDetail!);
  }

  async remove(id: number): Promise<void> {
    await this.dataSource.transaction(async (manager: EntityManager) => {
      const user = await this.userRepo.findOne({ where: { id } });
      if (!user) {
        throw new BadRequestException('User not found');
      }
      await this.orgService.removeUserFromAllOrganizations(manager, id);
      await manager.save(User, {
        ...user,
        status: userStatus.INACTIVE,
      });
      await manager.softDelete(User, id);
    });
  }
}
