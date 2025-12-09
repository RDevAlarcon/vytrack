// src/locations/locations.controller.ts
import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { LocationsService } from './locations.service';
import { CreateLocationDto } from './dto/create-location.dto';
import { QueryHistoryDto } from './dto/query-history.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { JwtPayload } from '../common/interfaces/jwt-payload.interface';

@Controller('locations')
@UseGuards(JwtAuthGuard /*, RolesGuard */) // TODO: agregar RolesGuard y @Roles para COMPANY_ADMIN/COMPANY_USER y permitir DRIVER para ingesta
export class LocationsController {
  constructor(private readonly locationsService: LocationsService) {}

  @Post()
  create(@CurrentUser() user: JwtPayload, @Body() dto: CreateLocationDto) {
    return this.locationsService.create(user.companyId!, dto);
  }

  @Get('vehicles/:vehicleId/latest')
  getLatest(@CurrentUser() user: JwtPayload, @Param('vehicleId') vehicleId: string) {
    return this.locationsService.getLatestForVehicle(user.companyId!, vehicleId);
  }

  @Get('live')
  getLive(@CurrentUser() user: JwtPayload) {
    return this.locationsService.getLiveForCompany(user.companyId!);
  }

  @Get('vehicles/:vehicleId/history')
  getHistory(
    @CurrentUser() user: JwtPayload,
    @Param('vehicleId') vehicleId: string,
    @Query() query: QueryHistoryDto,
  ) {
    return this.locationsService.getHistoryForVehicle(user.companyId!, vehicleId, query);
  }
}
