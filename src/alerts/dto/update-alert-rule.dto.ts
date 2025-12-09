// src/alerts/dto/update-alert-rule.dto.ts
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdateAlertRuleDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  threshold?: any;

  @IsOptional()
  schedule?: any;

  @IsOptional()
  @IsString()
  geofenceId?: string | null;

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
