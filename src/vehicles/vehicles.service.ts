// src/vehicles/vehicles.service.ts
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { Prisma, VehicleStatus } from '@prisma/client';

@Injectable()
export class VehiclesService {
  constructor(private prisma: PrismaService) {}

  private async ensureWithinPlan(companyId: string) {
    const activeSub = await this.prisma.companySubscription.findFirst({
      where: {
        companyId,
        status: 'ACTIVE',
        OR: [{ endsAt: null }, { endsAt: { gt: new Date() } }],
      },
      orderBy: { startsAt: 'desc' },
    });

    if (!activeSub) {
      throw new BadRequestException('La compañía no tiene una suscripción activa');
    }

    const count = await this.prisma.vehicle.count({ where: { companyId } });
    if (count >= activeSub.currentMaxVehicles) {
      throw new BadRequestException('Límite de vehículos del plan alcanzado para esta compañía');
    }
  }

  async create(companyId: string, dto: CreateVehicleDto) {
    await this.ensureWithinPlan(companyId);

    const status = dto.status ?? VehicleStatus.ACTIVE;
    const tags = dto.tags ?? [];

    try {
      return await this.prisma.vehicle.create({
        data: {
          companyId,
          plate: dto.plate,
          vin: dto.vin,
          type: dto.type,
          capacity: dto.capacity,
          status,
          tags,
        },
      });
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  findAll(companyId: string) {
    return this.prisma.vehicle.findMany({ where: { companyId } });
  }

  async findOne(companyId: string, id: string) {
    const vehicle = await this.prisma.vehicle.findFirst({
      where: { id, companyId },
    });
    if (!vehicle) {
      throw new NotFoundException('Vehículo no encontrado');
    }
    return vehicle;
  }

  async update(companyId: string, id: string, dto: UpdateVehicleDto) {
    await this.findOne(companyId, id); // asegura pertenencia

    const data: Prisma.VehicleUpdateInput = {
      plate: dto.plate,
      vin: dto.vin,
      type: dto.type,
      capacity: dto.capacity,
      status: dto.status,
      tags: dto.tags,
    };

    try {
      const result = await this.prisma.vehicle.updateMany({
        where: { id, companyId },
        data,
      });
      if (result.count === 0) {
        throw new NotFoundException('Vehículo no encontrado');
      }
      return this.findOne(companyId, id);
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  async remove(companyId: string, id: string) {
    const result = await this.prisma.vehicle.deleteMany({ where: { id, companyId } });
    if (result.count === 0) {
      throw new NotFoundException('Vehículo no encontrado');
    }
    return { deleted: true };
  }

  private handlePrismaError(error: any): never {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      const target = (error.meta?.target as string[]) || [];
      if (target.includes('plate')) {
        throw new BadRequestException('La placa ya existe en la compañía');
      }
      if (target.includes('vin')) {
        throw new BadRequestException('El VIN ya existe en la compañía');
      }
      throw new BadRequestException('Datos duplicados');
    }
    throw error;
  }
}
