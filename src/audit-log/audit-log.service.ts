// src/audit-log/audit-log.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { QueryAuditLogDto } from './dto/query-audit-log.dto';
import { UserRole } from '@prisma/client';

@Injectable()
export class AuditLogService {
  constructor(private prisma: PrismaService) {}

  async log(params: {
    companyId?: string | null;
    userId: string;
    action: string;
    entity: string;
    entityId: string;
    metadata?: any;
  }) {
    return this.prisma.auditLog.create({
      data: {
        companyId: params.companyId ?? null,
        userId: params.userId,
        action: params.action,
        entity: params.entity,
        entityId: params.entityId,
        metadata: params.metadata,
      },
    });
  }

  async findAll(userRole: UserRole, userCompanyId: string | null | undefined, query: QueryAuditLogDto) {
    const where: any = {};

    if (userRole !== UserRole.SUPERADMIN) {
      where.companyId = userCompanyId ?? undefined;
    } else if (query.companyId) {
      where.companyId = query.companyId;
    }

    if (query.userId) where.userId = query.userId;
    if (query.entity) where.entity = query.entity;
    if (query.action) where.action = query.action;
    if (query.from && query.to) {
      where.createdAt = { gte: new Date(query.from), lte: new Date(query.to) };
    }

    return this.prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, email: true, role: true, companyId: true } },
        company: { select: { id: true, name: true } },
      },
    });
  }
}
