import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RoleOrganizationGuard } from '@/common/guards/roleOrganization.guard';
import { RoleOrganization } from '@/common/decorators/roleOrganization.decorator';
import { OrganizationMemberRole } from '@/common/enum/organization.enum';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { User } from '@/database/entities/user.entity';
import { PaginationDto } from '@/common/dto/pagination.dto';

@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @UseGuards(JwtAuthGuard, RoleOrganizationGuard)
  @RoleOrganization(
    OrganizationMemberRole.ADMIN,
    OrganizationMemberRole.OWNER,
    OrganizationMemberRole.PROJECT_MANAGER,
  )
  @Post()
  create(
    @Body() createProjectDto: CreateProjectDto,
    @CurrentUser() user: User,
  ) {
    return this.projectsService.create(createProjectDto, user.id);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RoleOrganizationGuard)
  @RoleOrganization(
    OrganizationMemberRole.ADMIN,
    OrganizationMemberRole.OWNER,
    OrganizationMemberRole.PROJECT_MANAGER,
    OrganizationMemberRole.MEMBER,
  )
  findAll(@Query() query: PaginationDto) {
    return this.projectsService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.projectsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProjectDto: UpdateProjectDto) {
    return this.projectsService.update(+id, updateProjectDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.projectsService.remove(+id);
  }
}
