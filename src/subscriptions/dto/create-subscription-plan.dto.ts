// src/subscriptions/dto/create-subscription-plan.dto.ts
import { IsBoolean, IsInt, IsNumber, IsOptional, IsPositive, IsString } from 'class-validator';

export class CreateSubscriptionPlanDto {
  @IsString()
  name: string;

  @IsInt()
  @IsPositive()
  maxVehicles: number;

  @IsInt()
  @IsPositive()
  maxUsers: number;

  @IsNumber()
  @IsPositive()
  price: number;

  @IsString()
  tier: string;

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
