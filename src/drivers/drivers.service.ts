// src/drivers/drivers.service.ts
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDriverDto } from './dto/create-driver.dto';
import { UpdateDriverDto } from './dto/update-driver.dto';

@Injectable()
export class DriversService {
  constructor(private prisma: PrismaService) {}

  async create(companyId: string, dto: CreateDriverDto) {
    if (!companyId) throw new BadRequestException('companyId requerido');
    return this.prisma.driver.create({
      data: {
        companyId,
        name: dto.name,
        licenseNumber: dto.licenseNumber,
        licenseExpiry: dto.licenseExpiry ? new Date(dto.licenseExpiry) : undefined,
        active: dto.active ?? true,
      },
    });
  }

  findAll(companyId: string) {
    return this.prisma.driver.findMany({ where: { companyId } });
  }

  async findOne(companyId: string, id: string) {
    const driver = await this.prisma.driver.findFirst({ where: { id, companyId } });
    if (!driver) throw new NotFoundException('Driver no encontrado');
    return driver;
  }

  async update(companyId: string, id: string, dto: UpdateDriverDto) {
    await this.findOne(companyId, id); // asegura pertenencia

    const data: any = {
      name: dto.name,
      licenseNumber: dto.licenseNumber,
      licenseExpiry: dto.licenseExpiry ? new Date(dto.licenseExpiry) : undefined,
      active: dto.active,
    };

    const result = await this.prisma.driver.updateMany({
      where: { id, companyId },
      data,
    });
    if (result.count === 0) throw new NotFoundException('Driver no encontrado');
    return this.findOne(companyId, id);
  }

  async remove(companyId: string, id: string) {
    const result = await this.prisma.driver.deleteMany({ where: { id, companyId } });
    if (result.count === 0) throw new NotFoundException('Driver no encontrado');
    return { deleted: true };
  }
}
