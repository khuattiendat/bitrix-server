import {
  Controller,
  Get,
  Body,
  Param,
  Delete,
  Query,
  ParseIntPipe,
  Put,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { PaginationDto } from '@/common/dto/pagination.dto';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesSystemGuard } from '@/common/guards/roles.guard';
import { UserRole } from '@/common/enum/user.enum';
import { RoleSystem } from '@/common/decorators/roles.decorator';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { PayloadToken } from '@/common/types/payloadToken.type';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(JwtAuthGuard, RolesSystemGuard)
  @RoleSystem(UserRole.ADMIN)
  @Get()
  findAll(@Query() query: PaginationDto) {
    return this.userService.findAll(query);
  }
  @UseGuards(JwtAuthGuard, RolesSystemGuard)
  @RoleSystem(UserRole.ADMIN)
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.userService.findOne(id);
  }
  @UseGuards(JwtAuthGuard, RolesSystemGuard)
  @RoleSystem(UserRole.ADMIN)
  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.userService.update(+id, updateUserDto);
  }
  @UseGuards(JwtAuthGuard, RolesSystemGuard)
  @RoleSystem(UserRole.ADMIN)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: string) {
    return this.userService.remove(+id);
  }
  // check organization
  @UseGuards(JwtAuthGuard)
  @Get('check-organization/:orgId')
  checkOrganizationMembership(
    @Param('orgId', ParseIntPipe) orgId: number,
    @CurrentUser() user: PayloadToken,
  ) {
    const userId = user.id;
    return this.userService.checkOrganizationMembership(orgId, userId!);
  }
}
