import { User } from '@/database/entities/user.entity';
import { ProjectsService } from '@/modules/projects/projects.service';
import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import {
  OrganizationMemberRole,
  OrganizationMemberStatus,
} from '@/common/enum/organization.enum';
import { Reflector } from '@nestjs/core';
import { ROLE_ORGANIZATION_KEY } from '../decorators/roleOrganization.decorator';

@Injectable()
export class RoleOrganizationGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private readonly projectsService: ProjectsService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<
      OrganizationMemberRole[]
    >(ROLE_ORGANIZATION_KEY, [context.getHandler(), context.getClass()]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context
      .switchToHttp()
      .getRequest<{ user: User; body: { organizationId: number } }>();
    const user: User = request?.user;

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    const organizationId: number = request.body?.organizationId;
    if (!organizationId) {
      throw new ForbiddenException('Organization ID is required');
    }

    const member = await this.projectsService.getRoleUserInOrganization({
      userId: user.id,
      organizationId,
    });
    if (!member) {
      throw new ForbiddenException(
        'Bạn không có quyền truy cập vào tài nguyên này',
      );
    }
    if (member.status !== OrganizationMemberStatus.ACTIVE) {
      throw new ForbiddenException(
        'Tài khoản của bạn đang bị khóa hoặc đã rời tổ chức',
      );
    }

    if (!requiredRoles.includes(member.role)) {
      throw new ForbiddenException(
        'Bạn không có quyền truy cập vào tài nguyên này',
      );
    }

    return true;
  }
}
