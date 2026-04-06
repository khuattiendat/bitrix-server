import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { BaseEntity } from '@/common/base/base.entity';
import { UserRole, userStatus } from '@/common/enum/user.enum';
import { File } from '@/database/entities/file.entity';
import { OrganizationMember } from '@/database/entities/organizationMember.entity';
import { Notification } from './notification.entity';
import * as bcrypt from 'bcrypt';
@Entity('users')
export class User extends BaseEntity {
  @Column({ unique: true, nullable: false, length: 255 })
  email: string;
  @Column({
    nullable: false,
    select: false,
  })
  password: string;
  @Column({
    nullable: false,
    length: 255,
    name: 'full_name',
  })
  fullName: string;
  @ManyToOne(() => File, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'avatar_id' })
  avatar?: File | null;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.NONE,
    name: 'system_role',
  })
  systemRole: UserRole;
  @Column({
    type: 'enum',
    enum: userStatus,
    default: userStatus.ACTIVE,
  })
  status: userStatus;
  @Column({
    nullable: true,
    name: 'date_of_birth',
  })
  dateOfBirth: Date;
  @Column({
    nullable: true,
    name: 'last_login_at',
  })
  lastLoginAt: Date;
  @OneToMany(() => OrganizationMember, (member) => member.user)
  organizationMemberships: OrganizationMember[];
  @OneToMany(() => Notification, (notification) => notification.user)
  notifications: Notification[];
  // compare password
  async comparePassword(plain: string): Promise<boolean> {
    return bcrypt.compare(plain, this.password);
  }
}
