// src/audit-log/audit-log.controller.ts
import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuditLogService } from './audit-log.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { JwtPayload } from '../common/interfaces/jwt-payload.interface';
import { QueryAuditLogDto } from './dto/query-audit-log.dto';
import { UserRole } from '@prisma/client';

@Controller('audit-log')
@UseGuards(JwtAuthGuard /*, RolesGuard */) // TODO: SUPERADMIN ve todo; otros solo su compañía
export class AuditLogController {
  constructor(private readonly auditLogService: AuditLogService) {}

  @Get()
  findAll(@CurrentUser() user: JwtPayload, @Query() query: QueryAuditLogDto) {
    return this.auditLogService.findAll(user.role as UserRole, user.companyId, query);
  }
}
