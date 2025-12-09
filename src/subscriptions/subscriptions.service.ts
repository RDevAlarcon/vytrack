// src/subscriptions/subscriptions.service.ts
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSubscriptionPlanDto } from './dto/create-subscription-plan.dto';
import { UpdateSubscriptionPlanDto } from './dto/update-subscription-plan.dto';
import { UpdateCompanySubscriptionDto } from './dto/update-company-subscription.dto';
import { Prisma, SubscriptionStatus } from '@prisma/client';

@Injectable()
export class SubscriptionsService {
  constructor(private prisma: PrismaService) {}

  // PLANES
  async createPlan(dto: CreateSubscriptionPlanDto) {
    const active = dto.active ?? true;
    return this.prisma.subscriptionPlan.create({
      data: {
        name: dto.name,
        maxVehicles: dto.maxVehicles,
        maxUsers: dto.maxUsers,
        price: new Prisma.Decimal(dto.price),
        tier: dto.tier,
        active,
      },
    });
  }

  findAllPlans() {
    // Retorna todos los planes; se podría filtrar active=true si se requiere.
    return this.prisma.subscriptionPlan.findMany();
  }

  async findPlanById(id: string) {
    const plan = await this.prisma.subscriptionPlan.findUnique({ where: { id } });
    if (!plan) throw new NotFoundException('Plan no encontrado');
    return plan;
  }

  async updatePlan(id: string, dto: UpdateSubscriptionPlanDto) {
    await this.findPlanById(id);
    const data: any = {
      name: dto.name,
      maxVehicles: dto.maxVehicles,
      maxUsers: dto.maxUsers,
      tier: dto.tier,
      active: dto.active,
    };
    if (dto.price !== undefined) {
      data.price = new Prisma.Decimal(dto.price);
    }
    const res = await this.prisma.subscriptionPlan.updateMany({
      where: { id },
      data,
    });
    if (res.count === 0) throw new NotFoundException('Plan no encontrado');
    return this.findPlanById(id);
  }

  async removePlan(id: string) {
    const res = await this.prisma.subscriptionPlan.deleteMany({ where: { id } });
    if (res.count === 0) throw new NotFoundException('Plan no encontrado');
    // Nota: en producción podría ser preferible marcar como inactivo en vez de borrar.
    return { deleted: true };
  }

  // SUSCRIPCIÓN DE COMPAÑÍA
  async getCurrentCompanySubscription(companyId: string) {
    const sub = await this.prisma.companySubscription.findFirst({
      where: { companyId, status: SubscriptionStatus.ACTIVE, endsAt: null },
      include: {
        plan: {
          select: { id: true, name: true, tier: true, maxVehicles: true, maxUsers: true, price: true },
        },
      },
    });
    if (!sub) throw new NotFoundException('No hay suscripción activa para esta compañía');
    return sub;
  }

  async changeCompanyPlan(companyId: string, dto: UpdateCompanySubscriptionDto) {
    const plan = await this.prisma.subscriptionPlan.findFirst({
      where: { id: dto.planId, active: true },
    });
    if (!plan) throw new BadRequestException('El plan no existe o no está activo');

    const now = new Date();

    // Cancelar suscripción activa actual si existe
    await this.prisma.companySubscription.updateMany({
      where: { companyId, status: SubscriptionStatus.ACTIVE, endsAt: null },
      data: { status: SubscriptionStatus.CANCELLED, endsAt: now },
    });

    // Crear nueva suscripción
    return this.prisma.companySubscription.create({
      data: {
        companyId,
        planId: plan.id,
        status: SubscriptionStatus.ACTIVE,
        startsAt: now,
        endsAt: null,
        currentMaxVehicles: plan.maxVehicles,
        currentMaxUsers: plan.maxUsers,
      },
      include: {
        plan: {
          select: { id: true, name: true, tier: true, maxVehicles: true, maxUsers: true, price: true },
        },
      },
    });
  }

  async findAllActiveCompanySubs() {
    // TODO: restringir a SUPERADMIN
    return this.prisma.companySubscription.findMany({
      where: { status: SubscriptionStatus.ACTIVE, endsAt: null },
      include: {
        company: { select: { id: true, name: true } },
        plan: { select: { id: true, name: true, tier: true, maxVehicles: true, maxUsers: true, price: true } },
      },
    });
  }

  // HELPER DE LÍMITES
  async ensureCompanyWithinVehicleLimit(companyId: string) {
    // Pensado para ser usado por VehiclesService antes de crear un vehículo.
    const sub = await this.prisma.companySubscription.findFirst({
      where: { companyId, status: SubscriptionStatus.ACTIVE, endsAt: null },
    });
    if (!sub) {
      throw new BadRequestException('La compañía no tiene una suscripción activa');
    }
    const vehicleCount = await this.prisma.vehicle.count({ where: { companyId } });
    if (vehicleCount >= sub.currentMaxVehicles) {
      throw new BadRequestException('Límite de vehículos del plan alcanzado para esta compañía');
    }
    return true;
  }
}
