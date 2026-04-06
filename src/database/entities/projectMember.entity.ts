import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Project } from '@/database/entities/project.entity';
import { ProjectRole } from '@/common/enum/project.enum';
import { OrganizationMember } from '@/database/entities/organizationMember.entity';

@Entity('project_members')
export class ProjectMember {
  @PrimaryGeneratedColumn()
  id: number;
  @Column({
    name: 'role_in_project',
    type: 'enum',
    enum: ProjectRole,
    default: ProjectRole.MEMBER,
  })
  roleInProject: ProjectRole;
  @Column({
    name: 'joined_at',
    nullable: false,
    type: 'datetime',
    default: () => 'CURRENT_TIMESTAMP',
  })
  joinedAt: Date;
  // relations with projects
  @ManyToOne(() => Project, (project) => project.members, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'project_id' })
  project: Project;
  // relation with organization members
  @ManyToOne(() => OrganizationMember, (member) => member.projectMemberships, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'organization_member_id' })
  organizationMember: OrganizationMember;
}
