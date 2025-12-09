// src/subscriptions/dto/update-subscription-plan.dto.ts
import { IsBoolean, IsInt, IsNumber, IsOptional, IsPositive, IsString } from 'class-validator';

export class UpdateSubscriptionPlanDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsInt()
  @IsPositive()
  maxVehicles?: number;

  @IsOptional()
  @IsInt()
  @IsPositive()
  maxUsers?: number;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  price?: number;

  @IsOptional()
  @IsString()
  tier?: string;

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
