// src/drivers/drivers.controller.ts
import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { DriversService } from './drivers.service';
import { CreateDriverDto } from './dto/create-driver.dto';
import { UpdateDriverDto } from './dto/update-driver.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { JwtPayload } from '../common/interfaces/jwt-payload.interface';

@Controller('drivers')
@UseGuards(JwtAuthGuard /*, RolesGuard */) // TODO: agregar RolesGuard y @Roles para COMPANY_ADMIN/COMPANY_USER
export class DriversController {
  constructor(private readonly driversService: DriversService) {}

  @Post()
  create(@CurrentUser() user: JwtPayload, @Body() dto: CreateDriverDto) {
    return this.driversService.create(user.companyId!, dto);
  }

  @Get()
  findAll(@CurrentUser() user: JwtPayload) {
    return this.driversService.findAll(user.companyId!);
  }

  @Get(':id')
  findOne(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.driversService.findOne(user.companyId!, id);
  }

  @Patch(':id')
  update(@CurrentUser() user: JwtPayload, @Param('id') id: string, @Body() dto: UpdateDriverDto) {
    return this.driversService.update(user.companyId!, id, dto);
  }

  @Delete(':id')
  remove(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.driversService.remove(user.companyId!, id);
  }
}
