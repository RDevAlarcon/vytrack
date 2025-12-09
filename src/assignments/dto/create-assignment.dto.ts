// src/assignments/dto/create-assignment.dto.ts
import { IsDateString, IsOptional, IsString } from 'class-validator';

export class CreateAssignmentDto {
  @IsString()
  driverId: string;

  @IsString()
  vehicleId: string;

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
