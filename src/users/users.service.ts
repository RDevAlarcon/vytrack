import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';
import { UserRole } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(companyId: string | null | undefined, dto: CreateUserDto) {
    if (!companyId) throw new BadRequestException('companyId requerido');
    if (dto.role === UserRole.SUPERADMIN) {
      throw new BadRequestException('No se pueden crear SUPERADMIN desde este endpoint');
    }
    if (dto.role === UserRole.DRIVER && !dto.driverId) {
      throw new BadRequestException('driverId requerido para rol DRIVER');
    }
    if (dto.role !== UserRole.DRIVER && dto.driverId) {
      throw new BadRequestException('driverId solo se admite cuando el rol es DRIVER');
    }

    if (dto.role === UserRole.DRIVER && dto.driverId) {
      const driver = await this.prisma.driver.findFirst({ where: { id: dto.driverId, companyId } });
      if (!driver) {
        throw new BadRequestException('Driver no pertenece a la compañía o no existe');
      }
      const existing = await this.prisma.user.findFirst({ where: { driverId: dto.driverId } });
      if (existing) {
        throw new BadRequestException('Ya existe un usuario asociado a este driver');
      }
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);
    return this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash,
        role: dto.role,
        companyId,
        active: dto.active ?? true,
        driverId: dto.role === UserRole.DRIVER ? dto.driverId : null,
      },
    });
  }

  findAll(companyId: string | null | undefined) {
    if (!companyId) throw new BadRequestException('companyId requerido');
    return this.prisma.user.findMany({ where: { companyId } });
  }

  findOne(companyId: string | null | undefined, id: string) {
    if (!companyId) throw new BadRequestException('companyId requerido');
    return this.prisma.user.findFirst({ where: { id, companyId } });
  }

  async update(companyId: string | null | undefined, id: string, dto: UpdateUserDto) {
    if (!companyId) throw new BadRequestException('companyId requerido');
    const data: any = { ...dto };
    if (dto.password) {
      data.passwordHash = await bcrypt.hash(dto.password, 10);
      delete data.password;
    }
    if (data.driverId !== undefined) {
      delete data.driverId; // evitar cambiar la asociación de driver vía update
    }
    return this.prisma.user.updateMany({
      where: { id, companyId },
      data,
    });
  }

  remove(companyId: string | null | undefined, id: string) {
    if (!companyId) throw new BadRequestException('companyId requerido');
    return this.prisma.user.deleteMany({
      where: { id, companyId },
    });
  }
}
