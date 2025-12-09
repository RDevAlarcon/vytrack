import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { CompaniesService } from './companies.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
// import { RolesGuard } from '../common/guards/roles.guard';
// import { Roles } from '../common/decorators/roles.decorator';
// import { UserRole } from '@prisma/client';

@Controller('companies')
@UseGuards(JwtAuthGuard /*, RolesGuard */)
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  @Post()
  // @Roles(UserRole.SUPERADMIN)
  create(@Body() dto: CreateCompanyDto) {
    return this.companiesService.create(dto);
  }

  @Get()
  // @Roles(UserRole.SUPERADMIN)
  findAll() {
    return this.companiesService.findAll();
  }

  @Get(':id')
  // @Roles(UserRole.SUPERADMIN)
  findOne(@Param('id') id: string) {
    return this.companiesService.findOne(id);
  }

  @Patch(':id')
  // @Roles(UserRole.SUPERADMIN)
  update(@Param('id') id: string, @Body() dto: UpdateCompanyDto) {
    return this.companiesService.update(id, dto);
  }

  @Delete(':id')
  // @Roles(UserRole.SUPERADMIN)
  remove(@Param('id') id: string) {
    return this.companiesService.remove(id);
  }
}
