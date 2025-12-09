// src/assignments/assignments.service.ts
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { UpdateAssignmentDto } from './dto/update-assignment.dto';
import { UpdateAssignmentStatusDto } from './dto/update-assignment-status.dto';
import { AssignmentStatus } from '@prisma/client';

@Injectable()
export class AssignmentsService {
  constructor(private prisma: PrismaService) {}

  private parseDate(value?: string) {
    return value ? new Date(value) : undefined;
  }

  private async ensureDriverAndVehicle(companyId: string, driverId: string, vehicleId: string) {
    const [driver, vehicle] = await Promise.all([
      this.prisma.driver.findFirst({ where: { id: driverId, companyId } }),
      this.prisma.vehicle.findFirst({ where: { id: vehicleId, companyId } }),
    ]);
    if (!driver) throw new BadRequestException('Driver no pertenece a la compañía o no existe');
    if (!vehicle) throw new BadRequestException('Vehículo no pertenece a la compañía o no existe');
  }

  private async ensureNoInProgress(companyId: string, driverId: string, vehicleId: string, excludeId?: string) {
    const inProgress = await this.prisma.driverAssignment.findFirst({
      where: {
        companyId,
        status: AssignmentStatus.IN_PROGRESS,
        OR: [{ driverId }, { vehicleId }],
        NOT: excludeId ? { id: excludeId } : undefined,
      },
    });
    if (inProgress) {
      throw new BadRequestException('El driver o vehículo ya tiene una asignación en progreso');
    }
  }

  async create(companyId: string, dto: CreateAssignmentDto) {
    await this.ensureDriverAndVehicle(companyId, dto.driverId, dto.vehicleId);
    await this.ensureNoInProgress(companyId, dto.driverId, dto.vehicleId);

    return this.prisma.driverAssignment.create({
      data: {
        companyId,
        driverId: dto.driverId,
        vehicleId: dto.vehicleId,
        taskRef: dto.taskRef,
        startPlanned: this.parseDate(dto.startPlanned),
        endPlanned: this.parseDate(dto.endPlanned),
        status: AssignmentStatus.ASSIGNED,
        startedAt: null,
        endedAt: null,
      },
    });
  }

  findAll(companyId: string) {
    return this.prisma.driverAssignment.findMany({ where: { companyId } });
  }

  async findOne(companyId: string, id: string) {
    const assignment = await this.prisma.driverAssignment.findFirst({ where: { id, companyId } });
    if (!assignment) throw new NotFoundException('Asignación no encontrada');
    return assignment;
  }

  async update(companyId: string, id: string, dto: UpdateAssignmentDto) {
    await this.findOne(companyId, id); // asegura pertenencia

    const data = {
      taskRef: dto.taskRef,
      startPlanned: this.parseDate(dto.startPlanned),
      endPlanned: this.parseDate(dto.endPlanned),
    };

    const result = await this.prisma.driverAssignment.updateMany({
      where: { id, companyId },
      data,
    });
    if (result.count === 0) throw new NotFoundException('Asignación no encontrada');
    return this.findOne(companyId, id);
  }

  async updateStatus(companyId: string, id: string, dto: UpdateAssignmentStatusDto) {
    const assignment = await this.findOne(companyId, id);

    if (dto.status === AssignmentStatus.IN_PROGRESS) {
      await this.ensureNoInProgress(companyId, assignment.driverId, assignment.vehicleId, assignment.id);
    }

    const now = new Date();
    const data: any = { status: dto.status };

    if (dto.status === AssignmentStatus.IN_PROGRESS && !assignment.startedAt) {
      data.startedAt = now;
    }
    if (
      (dto.status === AssignmentStatus.COMPLETED || dto.status === AssignmentStatus.CANCELLED) &&
      !assignment.endedAt
    ) {
      data.endedAt = now;
    }

    const result = await this.prisma.driverAssignment.updateMany({
      where: { id, companyId },
      data,
    });
    if (result.count === 0) throw new NotFoundException('Asignación no encontrada');
    return this.findOne(companyId, id);
  }

  async remove(companyId: string, id: string) {
    const result = await this.prisma.driverAssignment.deleteMany({ where: { id, companyId } });
    if (result.count === 0) throw new NotFoundException('Asignación no encontrada');
    return { deleted: true };
  }
}
