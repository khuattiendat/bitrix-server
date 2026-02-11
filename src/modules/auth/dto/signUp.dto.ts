import { OrganizationMemberRole } from '@/common/enum/organization.enum';
import { IsEmail, IsNotEmpty, IsOptional, MinLength } from 'class-validator';

export class SignUpDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;
  @IsNotEmpty()
  @MinLength(6)
  password: string;
  @IsNotEmpty()
  fullName: string;
  @IsOptional()
  dateOfBirth: Date;
  @IsNotEmpty()
  organizations: {
    id: number;
    organizationRole: OrganizationMemberRole;
  }[];
}
