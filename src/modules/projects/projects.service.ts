import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateProjectDto } from './dto/create-project.dto';
import { DataSource, In, Repository } from 'typeorm';
import { UpdateProjectDto } from './dto/update-project.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Organization } from '@/database/entities/organization.entity';
import { OrganizationMember } from '@/database/entities/organizationMember.entity';
import { Project } from '@/database/entities/project.entity';
import { OrganizationMemberStatus } from '@/common/enum/organization.enum';
import { PaginationDto } from '@/common/dto/pagination.dto';
import { paginate } from '@/common/utils/paginate';
import { ProjectMember } from '@/database/entities/projectMember.entity';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(OrganizationMember)
    private organizationMemberRepository: Repository<OrganizationMember>,
    @InjectRepository(Organization)
    private organizationRepository: Repository<Organization>,
    @InjectRepository(Project)
    private projectRepository: Repository<Project>,
    @InjectRepository(ProjectMember)
    private projectMemberRepository: Repository<ProjectMember>,
    private readonly dataSource: DataSource,
  ) {}

  async create(createProjectDto: CreateProjectDto, userId: number) {
    const {
      name,
      description,
      organizationId,
      startDate,
      endDate,
      status,
      memberIds,
    } = createProjectDto;
    const [organization, createdBy] = await Promise.all([
      this.organizationRepository.findOne({
        where: { id: organizationId },
      }),
      this.organizationMemberRepository.findOne({
        where: { user: { id: userId }, organization: { id: organizationId } },
      }),
    ]);

    if (!organization) {
      throw new BadRequestException('Organization not found');
    }

    if (!createdBy) {
      throw new BadRequestException('User is not a member of the organization');
    }
    if (createdBy.status !== OrganizationMemberStatus.ACTIVE) {
      throw new BadRequestException('User is not active in the organization');
    }
    if (memberIds && memberIds.length > 0) {
      const memberInOrg = await this.getMmeberInOrganizationsByIds(
        memberIds,
        organization,
      );
      if (memberInOrg.length !== memberIds.length) {
        throw new BadRequestException(
          'Some members not found in the organization',
        );
      }
    }
    return this.dataSource.transaction(async (manager) => {
      const saved = await manager.save(Project, {
        name,
        description: description || '',
        organization,
        createdBy,
        startDate,
        endDate,
        status,
      });
      if (memberIds && memberIds.length > 0) {
        await Promise.all(
          memberIds.map((memberId) =>
            manager.save(ProjectMember, {
              project: { id: saved.id },
              organizationMember: { id: memberId },
              joinedAt: new Date(),
            }),
          ),
        );
      }
      const project = await manager.findOne(Project, {
        where: { id: saved.id },
        relations: [
          'members',
          'members.organizationMember',
          'members.organizationMember.user',
        ],
      });
      if (!project) {
        throw new BadRequestException('Project not found after creation');
      }
      return project;
    });
  }
  async getMmeberInOrganizationsByIds(
    memberOrganizationIds: number[],
    organization?: Organization,
  ) {
    const members = await this.organizationMemberRepository.find({
      where: {
        id: In(memberOrganizationIds),
        organization: { id: organization ? organization.id : undefined },
      },
    });
    return members;
  }

  async getRoleUserInOrganization({
    userId,
    organizationId,
  }: {
    userId: number;
    organizationId: number;
  }): Promise<OrganizationMember | null> {
    const member = await this.organizationMemberRepository.findOne({
      where: {
        user: { id: userId },
        organization: { id: organizationId },
      },
    });
    if (!member) {
      return null;
    }
    return member;
  }

  async findAll(query: PaginationDto) {
    const {
      page = 1,
      limit = 10,
      search = '',
      sortBy = 'createdAt',
      order = 'DESC',
    } = query;

    const sortableFields = new Set([
      'id',
      'name',
      'status',
      'startDate',
      'endDate',
      'createdAt',
    ]);
    const safeSortBy = sortableFields.has(sortBy) ? sortBy : 'createdAt';
    const safeOrder = order === 'ASC' ? 'ASC' : 'DESC';

    const qb = this.projectRepository
      .createQueryBuilder('project')
      .leftJoinAndSelect('project.members', 'members')
      .leftJoinAndSelect('members.organizationMember', 'orgMember')
      .leftJoinAndSelect('orgMember.user', 'user')
      .select([
        'project.id',
        'project.name',
        'project.description',
        'project.status',
        'project.startDate',
        'project.endDate',
        'project.createdAt',
        'members.id',
        'members.joinedAt',
        'members.organizationMember',
        'orgMember.id',
        'orgMember.role',
        'user.id',
        'user.fullName',
      ]);
    if (search.trim()) {
      qb.where('project.name LIKE :search', { search: `%${search.trim()}%` });
    }
    qb.orderBy(`project.${safeSortBy}`, safeOrder);
    const { data, meta } = await paginate(qb, page, limit);
    return {
      data,
      meta,
    };
  }

  findOne(id: number) {
    return `This action returns a #${id} project`;
  }

  update(id: number, updateProjectDto: UpdateProjectDto) {
    return `This action updates a #${id} project`;
  }

  remove(id: number) {
    return `This action removes a #${id} project`;
  }
}
