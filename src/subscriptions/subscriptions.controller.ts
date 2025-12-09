// src/subscriptions/subscriptions.controller.ts
import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { CreateSubscriptionPlanDto } from './dto/create-subscription-plan.dto';
import { UpdateSubscriptionPlanDto } from './dto/update-subscription-plan.dto';
import { UpdateCompanySubscriptionDto } from './dto/update-company-subscription.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { JwtPayload } from '../common/interfaces/jwt-payload.interface';

@Controller('subscriptions')
@UseGuards(JwtAuthGuard /*, RolesGuard */) // TODO: limitar planes a SUPERADMIN; company endpoints a COMPANY_ADMIN/USER
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  // PLANES (globales)
  @Post('plans')
  createPlan(@Body() dto: CreateSubscriptionPlanDto) {
    return this.subscriptionsService.createPlan(dto);
  }

  @Get('plans')
  findAllPlans() {
    return this.subscriptionsService.findAllPlans();
  }

  @Get('plans/:id')
  findPlan(@Param('id') id: string) {
    return this.subscriptionsService.findPlanById(id);
  }

  @Patch('plans/:id')
  updatePlan(@Param('id') id: string, @Body() dto: UpdateSubscriptionPlanDto) {
    return this.subscriptionsService.updatePlan(id, dto);
  }

  @Delete('plans/:id')
  removePlan(@Param('id') id: string) {
    return this.subscriptionsService.removePlan(id);
  }

  // SUSCRIPCIÓN DE COMPAÑÍA
  @Get('company/current')
  getCurrent(@CurrentUser() user: JwtPayload) {
    return this.subscriptionsService.getCurrentCompanySubscription(user.companyId!);
  }

  @Patch('company/current')
  changePlan(@CurrentUser() user: JwtPayload, @Body() dto: UpdateCompanySubscriptionDto) {
    return this.subscriptionsService.changeCompanyPlan(user.companyId!, dto);
  }

  // Opcional global: listar suscripciones activas de todas las compañías
  @Get('companies')
  listCompaniesActiveSubs() {
    return this.subscriptionsService.findAllActiveCompanySubs();
  }
}
