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

    const passwordHash = await bcrypt.hash(dto.password, 10);
    return this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash,
        role: dto.role,
        companyId,
        active: dto.active ?? true,
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
