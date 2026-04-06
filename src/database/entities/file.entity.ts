import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { FileStoreType } from '@/common/enum/file.enum';
import { BaseEntity } from '@/common/base/base.entity';
import { Organization } from '@/database/entities/organization.entity';
import { OrganizationMember } from '@/database/entities/organizationMember.entity';
import { Project } from '@/database/entities/project.entity';
import { FeedPostAttachment } from './feedPostAttachment.entity';
import { CommentAttachment } from './commentAttachment.entity';
import { ChatMessageAttachment } from './chatMessageAttachment.entity';

@Entity('files')
export class File extends BaseEntity {
  @Column({
    nullable: false,
    name: 'file_name',
  })
  fileName: string;
  @Column({
    nullable: false,
    name: 'mime_type',
  })
  mimeType: string;
  @Column({
    nullable: false,
    name: 'size',
  })
  size: number;
  @Column({
    nullable: false,
    name: 'url',
  })
  url: string;
  @Column({
    type: 'enum',
    enum: FileStoreType,
    default: FileStoreType.LOCAL,
    name: 'storage',
  })
  storage: FileStoreType;
  // relations with organization
  @ManyToOne(() => Organization, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'organization_id' })
  organization?: Organization | null;
  // relations with organization members
  @ManyToOne(() => OrganizationMember, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'uploaded_by' })
  uploadedBy?: OrganizationMember | null;
  // relations with project
  @ManyToOne(() => Project, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'project_id' })
  project?: Project | null;
  // rellation file
  @OneToMany(() => FeedPostAttachment, (attachment) => attachment.file, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  feedPostAttachments?: FeedPostAttachment[];
  // relation comment
  @OneToMany(() => CommentAttachment, (attachment) => attachment.file, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  commentAttachments?: CommentAttachment[];
  // add more relations if needed
  @OneToMany(() => ChatMessageAttachment, (attachment) => attachment.file, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  chatMessageAttachments?: ChatMessageAttachment[];
}
