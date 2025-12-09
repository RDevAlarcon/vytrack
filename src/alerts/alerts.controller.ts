// src/alerts/alerts.controller.ts
import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { AlertsService } from './alerts.service';
import { CreateAlertRuleDto } from './dto/create-alert-rule.dto';
import { UpdateAlertRuleDto } from './dto/update-alert-rule.dto';
import { QueryAlertsDto } from './dto/query-alerts.dto';
import { UpdateAlertStatusDto } from './dto/update-alert-status.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { JwtPayload } from '../common/interfaces/jwt-payload.interface';

@Controller('alerts')
@UseGuards(JwtAuthGuard /*, RolesGuard */) // TODO: agregar RolesGuard y @Roles para COMPANY_ADMIN/COMPANY_USER
export class AlertsController {
  constructor(private readonly alertsService: AlertsService) {}

  // Reglas
  @Post('rules')
  createRule(@CurrentUser() user: JwtPayload, @Body() dto: CreateAlertRuleDto) {
    return this.alertsService.createRule(user.companyId!, dto);
  }

  @Get('rules')
  findAllRules(@CurrentUser() user: JwtPayload) {
    return this.alertsService.findAllRules(user.companyId!);
  }

  @Get('rules/:id')
  findRule(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.alertsService.findRuleById(user.companyId!, id);
  }

  @Patch('rules/:id')
  updateRule(@CurrentUser() user: JwtPayload, @Param('id') id: string, @Body() dto: UpdateAlertRuleDto) {
    return this.alertsService.updateRule(user.companyId!, id, dto);
  }

  @Delete('rules/:id')
  removeRule(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.alertsService.removeRule(user.companyId!, id);
  }

  // Eventos
  @Get('events')
  findEvents(@CurrentUser() user: JwtPayload, @Query() query: QueryAlertsDto) {
    return this.alertsService.findEvents(user.companyId!, query);
  }

  @Get('events/:id')
  findEvent(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.alertsService.findEventById(user.companyId!, id);
  }

  @Patch('events/:id/status')
  updateEventStatus(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: UpdateAlertStatusDto,
  ) {
    return this.alertsService.updateEventStatus(user.companyId!, id, dto);
  }
}
