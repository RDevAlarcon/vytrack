// src/locations/locations.service.ts
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLocationDto } from './dto/create-location.dto';
import { QueryHistoryDto } from './dto/query-history.dto';

@Injectable()
export class LocationsService {
  constructor(private prisma: PrismaService) {}

  private parseDate(value?: string): Date | undefined {
    return value ? new Date(value) : undefined;
  }

  private async ensureVehicle(companyId: string, vehicleId: string) {
    const vehicle = await this.prisma.vehicle.findFirst({ where: { id: vehicleId, companyId } });
    if (!vehicle) throw new BadRequestException('Vehículo no pertenece a la compañía o no existe');
    return vehicle;
  }

  private async ensureDriver(companyId: string, driverId?: string) {
    if (!driverId) return;
    const driver = await this.prisma.driver.findFirst({ where: { id: driverId, companyId } });
    if (!driver) throw new BadRequestException('Driver no pertenece a la compañía o no existe');
  }

  private async ensureDevice(companyId: string, deviceId?: string) {
    if (!deviceId) return;
    const device = await this.prisma.device.findFirst({ where: { id: deviceId, companyId } });
    if (!device) throw new BadRequestException('Device no pertenece a la compañía o no existe');
  }

  async create(companyId: string, dto: CreateLocationDto) {
    await this.ensureVehicle(companyId, dto.vehicleId);
    await this.ensureDriver(companyId, dto.driverId);
    await this.ensureDevice(companyId, dto.deviceId);

    const timestamp = this.parseDate(dto.timestamp) ?? new Date();

    return this.prisma.location.create({
      data: {
        companyId,
        vehicleId: dto.vehicleId,
        driverId: dto.driverId,
        deviceId: dto.deviceId,
        timestamp,
        lat: dto.lat,
        lng: dto.lng,
        speedKmh: dto.speedKmh,
        heading: dto.heading,
        accuracyM: dto.accuracyM,
        source: dto.source,
        raw: dto.raw,
      },
    });
  }

  async getLatestForVehicle(companyId: string, vehicleId: string) {
    await this.ensureVehicle(companyId, vehicleId);
    const loc = await this.prisma.location.findFirst({
      where: { companyId, vehicleId },
      orderBy: { timestamp: 'desc' },
    });
    if (!loc) throw new NotFoundException('No hay ubicaciones para este vehículo');
    return loc;
  }

  async getLiveForCompany(companyId: string) {
    // Estrategia simple: tomar las ubicaciones más recientes y agrupar en memoria.
    const recent = await this.prisma.location.findMany({
      where: { companyId },
      orderBy: { timestamp: 'desc' },
      take: 1000,
      include: {
        vehicle: { select: { plate: true } },
      },
    });

    const byVehicle = new Map<string, any>();
    for (const loc of recent) {
      if (!byVehicle.has(loc.vehicleId)) {
        byVehicle.set(loc.vehicleId, {
          vehicleId: loc.vehicleId,
          vehiclePlate: loc.vehicle.plate,
          timestamp: loc.timestamp,
          lat: loc.lat,
          lng: loc.lng,
          speedKmh: loc.speedKmh,
        });
      }
    }
    return Array.from(byVehicle.values());
  }

  async getHistoryForVehicle(companyId: string, vehicleId: string, query: QueryHistoryDto) {
    await this.ensureVehicle(companyId, vehicleId);
    const from = this.parseDate(query.from);
    const to = this.parseDate(query.to);
    if (!from || !to || from > to) {
      throw new BadRequestException('Rango de fechas inválido');
    }
    return this.prisma.location.findMany({
      where: {
        companyId,
        vehicleId,
        timestamp: { gte: from, lte: to },
      },
      orderBy: { timestamp: 'asc' },
      select: {
        id: true,
        timestamp: true,
        lat: true,
        lng: true,
        speedKmh: true,
        heading: true,
        accuracyM: true,
      },
    });
  }
}
