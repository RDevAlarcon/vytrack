// src/assignments/dto/update-assignment.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateAssignmentDto } from './create-assignment.dto';
import { IsDateString, IsOptional, IsString } from 'class-validator';

export class UpdateAssignmentDto extends PartialType(CreateAssignmentDto) {
  @IsOptional()
  @IsString()
  taskRef?: string;

  @IsOptional()
  @IsDateString()
  startPlanned?: string;

  @IsOptional()
  @IsDateString()
  endPlanned?: string;
}
