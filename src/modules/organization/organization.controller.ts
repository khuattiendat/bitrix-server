import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  Put,
  ParseIntPipe,
} from '@nestjs/common';
import { OrganizationService } from './organization.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesSystemGuard } from '@/common/guards/roles.guard';
import { RoleSystem } from '@/common/decorators/roles.decorator';
import { UserRole } from '@/common/enum/user.enum';
import { PaginationDto } from '@/common/dto/pagination.dto';

@Controller('organizations')
export class OrganizationController {
  constructor(private readonly organizationService: OrganizationService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesSystemGuard)
  @RoleSystem(UserRole.ADMIN)
  create(@Body() createOrganizationDto: CreateOrganizationDto) {
    return this.organizationService.create(createOrganizationDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesSystemGuard)
  @RoleSystem(UserRole.ADMIN)
  findAll(@Query() query: PaginationDto) {
    return this.organizationService.findAll(query);
  }

  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateOrganizationDto: UpdateOrganizationDto,
  ) {
    return this.organizationService.update(id, updateOrganizationDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.organizationService.remove(+id);
  }
}
