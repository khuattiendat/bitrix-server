import { ProjectStatus } from '@/common/enum/project.enum';
import { IsArray, IsEnum, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateProjectDto {
  @IsNotEmpty()
  name: string;
  @IsOptional()
  description?: string;
  @IsEnum(ProjectStatus)
  @IsOptional()
  status?: ProjectStatus;
  @IsOptional()
  startDate?: Date;
  @IsOptional()
  endDate?: Date;
  @IsNotEmpty()
  organizationId: number;
  @IsOptional()
  @IsArray()
  memberIds?: number[];
}
