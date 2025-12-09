// src/locations/dto/create-location.dto.ts
import { IsDateString, IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { LocationSource } from '@prisma/client';

export class CreateLocationDto {
  @IsString()
  vehicleId: string;

  @IsOptional()
  @IsString()
  driverId?: string;

  @IsOptional()
  @IsString()
  deviceId?: string;

  @IsOptional()
  @IsDateString()
  timestamp?: string;

  @IsNumber()
  lat: number;

  @IsNumber()
  lng: number;

  @IsOptional()
  @IsNumber()
  speedKmh?: number;

  @IsOptional()
  @IsNumber()
  heading?: number;

  @IsOptional()
  @IsNumber()
  accuracyM?: number;

  @IsEnum(LocationSource)
  source: LocationSource;

  @IsOptional()
  raw?: any;
}
