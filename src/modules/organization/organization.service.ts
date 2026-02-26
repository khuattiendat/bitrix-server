import { BadRequestException, HttpException, Injectable } from '@nestjs/common';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { PaginationDto } from '@/common/dto/pagination.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Not, Repository } from 'typeorm';
import { Organization } from '@/database/entities/organization.entity';
import { ORGANIZATION_SORTABLE_FIELDS } from '@/common/constants/organization.const';
import { paginate } from '@/common/utils/paginate';
import { OrganizationMember } from '@/database/entities/organizationMember.entity';
import { generateSlug } from '@/common/utils/generate';
import { OrganizationStatus } from '@/common/enum/organization.enum';

@Injectable()
export class OrganizationService {
  constructor(
    @InjectRepository(Organization)
    private readonly orgRepo: Repository<Organization>,
    @InjectRepository(OrganizationMember)
    private readonly orgMemberRepo: Repository<OrganizationMember>,
  ) {}
  async create(createOrganizationDto: CreateOrganizationDto) {
    const { name, taxCode } = createOrganizationDto;
    const slug = generateSlug(name);

    await this.validateUniqueOrganization(name, slug, taxCode);

    const org = this.orgRepo.create({ ...createOrganizationDto, slug });
    return await this.orgRepo.save(org);
  }
  async update(id: number, updateOrganizationDto: UpdateOrganizationDto) {
    const { name, taxCode, address, status } = updateOrganizationDto;
    const org = await this.orgRepo.findOne({ where: { id } });
    if (!org) {
      throw new HttpException('Organization not found', 404);
    }
    await this.validateUniqueOrganization(name, org.slug, taxCode, id);
    org.name = name;
    org.taxCode = taxCode;
    org.address = address;
    org.status = status as OrganizationStatus;
    return await this.orgRepo.save(org);
  }

  private async validateUniqueOrganization(
    name: string,
    slug: string,
    taxCode: string,
    orgId?: number,
  ) {
    const excludeId = orgId ? { id: Not(orgId) } : {};

    const [existingOrg, existingTaxCode] = await Promise.all([
      this.orgRepo.findOne({
        where: [
          { name, ...excludeId },
          { slug, ...excludeId },
        ],
      }),
      this.orgRepo.findOne({
        where: { taxCode, ...excludeId },
      }),
    ]);

    if (existingOrg) {
      throw new BadRequestException(
        'Organization with the same name already exists',
      );
    }
    if (existingTaxCode) {
      throw new BadRequestException(
        'Organization with the same tax code already exists',
      );
    }
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
      .select([
        'organization.id',
        'organization.name',
        'organization.address',
        'organization.taxCode',
        'organization.createdAt',
        'organization.status',
      ]);

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
  async removeUserFromAllOrganizations(manager: EntityManager, userId: number) {
    await manager
      .createQueryBuilder()
      .delete()
      .from(OrganizationMember)
      .where('user_id = :userId', { userId })
      .execute();
  }

  remove(id: number) {
    return this.orgRepo.delete(id);
  }
}
