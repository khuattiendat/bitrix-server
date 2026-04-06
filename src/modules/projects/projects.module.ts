import { Module } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { ProjectsController } from './projects.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrganizationMember } from '@/database/entities/organizationMember.entity';
import { Organization } from '@/database/entities/organization.entity';
import { Project } from '@/database/entities/project.entity';
import { ProjectMember } from '@/database/entities/projectMember.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      OrganizationMember,
      Organization,
      Project,
      ProjectMember,
    ]),
  ],
  controllers: [ProjectsController],
  providers: [ProjectsService],
  exports: [ProjectsService],
})
export class ProjectsModule {}
