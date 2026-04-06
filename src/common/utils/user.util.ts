import { User } from '@/database/entities/user.entity';

export const validateUserResponse = (user: User) => {
  const { organizationMemberships, password, ...rest } = user;
  const organizations = organizationMemberships.map((membership) => {
    return {
      id: membership.organization.id,
      name: membership.organization.name,
      organizationRole: membership.role,
    };
  });
  return {
    ...rest,
    organizations,
  };
};
