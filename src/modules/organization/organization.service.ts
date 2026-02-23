import { Injectable } from '@nestjs/common';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { PaginationDto } from '@/common/dto/pagination.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Organization } from '@/database/entities/organization.entity';
import { ORGANIZATION_SORTABLE_FIELDS } from '@/common/constants/organization.const';
import { paginate } from '@/common/utils/paginate';

@Injectable()
export class OrganizationService {
  constructor(
    @InjectRepository(Organization)
    private readonly orgRepo: Repository<Organization>,
  ) {}
  create(createOrganizationDto: CreateOrganizationDto) {
    return 'This action adds a new organization';
  }

  findAll(query: PaginationDto) {
    const {
      page = 1,
      limit = 10,
      search,
      sortBy = 'createdAt',
      order = 'DESC',
    } = query;
    const qb = this.orgRepo
      .createQueryBuilder('organization')
      .select(['organization.id', 'organization.name', 'organization.address']);

    if (search?.trim()) {
      qb.andWhere(
        'organization.name LIKE :keyword OR organization.taxCode LIKE :keyword',
        {
          keyword: `%${search.trim()}%`,
        },
      );
    }
    if (ORGANIZATION_SORTABLE_FIELDS.includes(sortBy)) {
      qb.orderBy(`organization.${sortBy}`, order);
    } else {
      qb.orderBy('organization.createdAt', 'DESC');
    }
    return paginate(qb, page, limit);
  }
  async removeUserFromAllOrganizations(userId: number) {
    return this.orgRepo
      .createQueryBuilder()
      .relation(Organization, 'members')
      .of(userId)
      .remove(userId);
  }

  findOne(id: number) {
    return `This action returns a #${id} organization`;
  }

  update(id: number, updateOrganizationDto: UpdateOrganizationDto) {
    return `This action updates a #${id} organization`;
  }

  remove(id: number) {
    return `This action removes a #${id} organization`;
  }
}
