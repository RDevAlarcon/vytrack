// src/alerts/dto/update-alert-status.dto.ts
import { IsEnum } from 'class-validator';
import { AlertStatus } from '@prisma/client';

export class UpdateAlertStatusDto {
  @IsEnum(AlertStatus)
  status: AlertStatus;
}
