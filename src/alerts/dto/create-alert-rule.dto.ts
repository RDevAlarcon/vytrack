// src/alerts/dto/create-alert-rule.dto.ts
import { IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';
import { AlertType } from '@prisma/client';

export class CreateAlertRuleDto {
  @IsString()
  name: string;

  @IsEnum(AlertType)
  type: AlertType;

  @IsOptional()
  threshold?: any;

  @IsOptional()
  schedule?: any;

  @IsOptional()
  @IsString()
  geofenceId?: string;

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
