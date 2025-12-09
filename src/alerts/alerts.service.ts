// src/alerts/alerts.service.ts
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAlertRuleDto } from './dto/create-alert-rule.dto';
import { UpdateAlertRuleDto } from './dto/update-alert-rule.dto';
import { QueryAlertsDto } from './dto/query-alerts.dto';
import { UpdateAlertStatusDto } from './dto/update-alert-status.dto';
import { AlertStatus, AlertType } from '@prisma/client';

@Injectable()
export class AlertsService {
  constructor(private prisma: PrismaService) {}

  private async ensureGeofence(companyId: string, geofenceId?: string | null) {
    if (!geofenceId) return;
    const geofence = await this.prisma.geofence.findFirst({ where: { id: geofenceId, companyId } });
    if (!geofence) throw new BadRequestException('Geofence no pertenece a la compañía o no existe');
  }

  private async ensureVehicle(companyId: string, vehicleId: string) {
    const vehicle = await this.prisma.vehicle.findFirst({ where: { id: vehicleId, companyId } });
    if (!vehicle) throw new BadRequestException('Vehículo no pertenece a la compañía o no existe');
  }

  private async ensureDriver(companyId: string, driverId?: string) {
    if (!driverId) return;
    const driver = await this.prisma.driver.findFirst({ where: { id: driverId, companyId } });
    if (!driver) throw new BadRequestException('Driver no pertenece a la compañía o no existe');
  }

  // Reglas
  async createRule(companyId: string, dto: CreateAlertRuleDto) {
    await this.ensureGeofence(companyId, dto.geofenceId);
    const active = dto.active ?? true;
    return this.prisma.alertRule.create({
      data: {
        companyId,
        name: dto.name,
        type: dto.type,
        threshold: dto.threshold,
        schedule: dto.schedule,
        geofenceId: dto.geofenceId,
        active,
      },
    });
  }

  findAllRules(companyId: string) {
    return this.prisma.alertRule.findMany({ where: { companyId } });
  }

  async findRuleById(companyId: string, id: string) {
    const rule = await this.prisma.alertRule.findFirst({ where: { id, companyId } });
    if (!rule) throw new NotFoundException('Regla no encontrada');
    return rule;
  }

  async updateRule(companyId: string, id: string, dto: UpdateAlertRuleDto) {
    await this.findRuleById(companyId, id);
    if (dto.geofenceId !== undefined) {
      await this.ensureGeofence(companyId, dto.geofenceId);
    }

    const result = await this.prisma.alertRule.updateMany({
      where: { id, companyId },
      data: {
        name: dto.name,
        threshold: dto.threshold,
        schedule: dto.schedule,
        geofenceId: dto.geofenceId,
        active: dto.active,
      },
    });
    if (result.count === 0) throw new NotFoundException('Regla no encontrada');
    return this.findRuleById(companyId, id);
  }

  async removeRule(companyId: string, id: string) {
    const res = await this.prisma.alertRule.deleteMany({ where: { id, companyId } });
    if (res.count === 0) throw new NotFoundException('Regla no encontrada');
    return { deleted: true };
  }

  // Eventos
  async findEvents(companyId: string, query: QueryAlertsDto) {
    const where: any = { companyId };
    if (query.status) where.status = query.status;
    if (query.type) where.type = query.type;
    if (query.vehicleId) where.vehicleId = query.vehicleId;
    if (query.from && query.to) {
      const from = new Date(query.from);
      const to = new Date(query.to);
      where.occurredAt = { gte: from, lte: to };
    }

    return this.prisma.alertEvent.findMany({
      where,
      orderBy: { occurredAt: 'desc' },
      include: {
        vehicle: { select: { id: true, plate: true } },
        alertRule: { select: { id: true, name: true, type: true } },
      },
    });
  }

  async findEventById(companyId: string, id: string) {
    const event = await this.prisma.alertEvent.findFirst({
      where: { id, companyId },
      include: {
        vehicle: { select: { id: true, plate: true } },
        alertRule: { select: { id: true, name: true, type: true } },
      },
    });
    if (!event) throw new NotFoundException('Evento no encontrado');
    return event;
  }

  async updateEventStatus(companyId: string, id: string, dto: UpdateAlertStatusDto) {
    const event = await this.findEventById(companyId, id);
    const data: any = { status: dto.status };
    if (dto.status === AlertStatus.RESOLVED && !event.resolvedAt) {
      data.resolvedAt = new Date();
    }
    const res = await this.prisma.alertEvent.updateMany({
      where: { id, companyId },
      data,
    });
    if (res.count === 0) throw new NotFoundException('Evento no encontrado');
    return this.findEventById(companyId, id);
  }

  // Punto de entrada futuro para generación de eventos
  async createEventFromContext(
    companyId: string,
    input: {
      vehicleId: string;
      driverId?: string;
      alertRuleId?: string;
      type: AlertType;
      payload?: any;
      occurredAt?: Date;
    },
  ) {
    await this.ensureVehicle(companyId, input.vehicleId);
    await this.ensureDriver(companyId, input.driverId);

    const occurredAt = input.occurredAt ?? new Date();

    return this.prisma.alertEvent.create({
      data: {
        companyId,
        vehicleId: input.vehicleId,
        driverId: input.driverId,
        alertRuleId: input.alertRuleId,
        type: input.type,
        payload: input.payload,
        occurredAt,
        status: AlertStatus.OPEN,
      },
    });
  }
}
