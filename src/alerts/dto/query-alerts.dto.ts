// src/alerts/dto/query-alerts.dto.ts
import { IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';
import { AlertStatus, AlertType } from '@prisma/client';

export class QueryAlertsDto {
  @IsOptional()
  @IsEnum(AlertStatus)
  status?: AlertStatus;

  @IsOptional()
  @IsEnum(AlertType)
  type?: AlertType;

  @IsOptional()
  @IsString()
  vehicleId?: string;

  @IsOptional()
  @IsDateString()
  from?: string;

  @IsOptional()
  @IsDateString()
  to?: string;
}
