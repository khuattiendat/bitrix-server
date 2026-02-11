import { BadRequestException, Injectable } from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '@/database/entities/user.entity';
import { Repository } from 'typeorm';
import { PaginationDto } from '@/common/dto/pagination.dto';
import { paginate } from '@/common/utils/paginate';
import { USER_SORTABLE_FIELDS } from '@/common/constants/user.const';
import { AuthService } from '../auth/auth.service';
import { validateUserResponse } from '@/common/utils/user.util';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly authService: AuthService,
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
        'user.createdAt',
      ])
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
    const { dateOfBirth, fullName, email } = updateUserDto;
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) {
      throw new BadRequestException('User not found');
    }
    await this.userRepo.update(id, {
      ...user,
      dateOfBirth: dateOfBirth ?? user.dateOfBirth,
      fullName: fullName ?? user.fullName,
      email: email ?? user.email,
    });
    const userDetail = await this.authService.getProfileinfoUser({
      userId: id,
    });

    return validateUserResponse(userDetail!);
  }

  remove(id: number) {
    const user = this.userRepo.findOne({ where: { id } });
    if (!user) {
      throw new BadRequestException('User not found');
    }
    return this.userRepo.softDelete(id);
  }
}
