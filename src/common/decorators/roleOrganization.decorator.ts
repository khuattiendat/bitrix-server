import { SetMetadata } from '@nestjs/common';
import { OrganizationMemberRole } from '../enum/organization.enum';

export const ROLE_ORGANIZATION_KEY = 'role_organization';
export const RoleOrganization = (...role: OrganizationMemberRole[]) =>
  SetMetadata(ROLE_ORGANIZATION_KEY, role);
