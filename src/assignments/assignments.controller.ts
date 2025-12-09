// src/assignments/assignments.controller.ts
import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { AssignmentsService } from './assignments.service';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { UpdateAssignmentDto } from './dto/update-assignment.dto';
import { UpdateAssignmentStatusDto } from './dto/update-assignment-status.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { JwtPayload } from '../common/interfaces/jwt-payload.interface';

@Controller('assignments')
@UseGuards(JwtAuthGuard /*, RolesGuard */) // TODO: agregar RolesGuard y @Roles para COMPANY_ADMIN/COMPANY_USER
export class AssignmentsController {
  constructor(private readonly assignmentsService: AssignmentsService) {}

  @Post()
  create(@CurrentUser() user: JwtPayload, @Body() dto: CreateAssignmentDto) {
    return this.assignmentsService.create(user.companyId!, dto);
  }

  @Get()
  findAll(@CurrentUser() user: JwtPayload) {
    return this.assignmentsService.findAll(user.companyId!);
  }

  @Get(':id')
  findOne(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.assignmentsService.findOne(user.companyId!, id);
  }

  @Patch(':id')
  update(@CurrentUser() user: JwtPayload, @Param('id') id: string, @Body() dto: UpdateAssignmentDto) {
    return this.assignmentsService.update(user.companyId!, id, dto);
  }

  @Patch(':id/status')
  updateStatus(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: UpdateAssignmentStatusDto,
  ) {
    return this.assignmentsService.updateStatus(user.companyId!, id, dto);
  }

  @Delete(':id')
  remove(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.assignmentsService.remove(user.companyId!, id);
  }
}
