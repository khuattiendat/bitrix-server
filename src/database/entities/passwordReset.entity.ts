import { BaseEntity } from '@/common/base/base.entity';
import { Column, Entity } from 'typeorm';

@Entity('password_resets')
export class PasswordReset extends BaseEntity {
  @Column({ nullable: false })
  email: string;

  @Column({ nullable: false })
  token: string;

  @Column({ type: 'timestamp', nullable: true })
  expiresAt: Date;
}
