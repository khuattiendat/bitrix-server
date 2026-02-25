import { SignUpDto } from '@/modules/auth/dto/signUp.dto';
import { OmitType, PartialType } from '@nestjs/mapped-types';
import { IsOptional, MinLength, ValidateIf } from 'class-validator';

export class UpdateUserDto extends PartialType(
  OmitType(SignUpDto, ['password'] as const),
) {
  @IsOptional()
  @ValidateIf((obj) => obj.password !== undefined && obj.password !== '')
  @MinLength(6)
  password?: string | undefined;
}
