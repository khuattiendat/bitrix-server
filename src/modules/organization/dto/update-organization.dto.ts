import { PartialType } from '@nestjs/mapped-types';
import { CreateOrganizationDto } from './create-organization.dto';
import { OrganizationStatus } from '@/common/enum/organization.enum';
import { IsEnum } from 'class-validator';

export class UpdateOrganizationDto extends PartialType(CreateOrganizationDto) {
  name: string;
  address: string;
  taxCode: string;
  @IsEnum(OrganizationStatus)
  status: OrganizationStatus;
}
