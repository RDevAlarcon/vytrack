// src/drivers/dto/create-driver.dto.ts
import { IsBoolean, IsDateString, IsOptional, IsString } from 'class-validator';

export class CreateDriverDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  licenseNumber?: string;

  @IsOptional()
  @IsDateString()
  licenseExpiry?: string;

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
