// src/assignments/dto/update-assignment-status.dto.ts
import { IsEnum } from 'class-validator';
import { AssignmentStatus } from '@prisma/client';

export class UpdateAssignmentStatusDto {
  @IsEnum(AssignmentStatus)
  status: AssignmentStatus;
}
