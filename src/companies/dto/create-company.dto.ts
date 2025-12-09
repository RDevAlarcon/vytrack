import { IsEmail, IsOptional, IsString } from 'class-validator';

export class CreateCompanyDto {
  @IsString()
  name: string;

  @IsString()
  country: string;

  @IsString()
  currency: string;

  @IsEmail()
  contactEmail: string;

  @IsString()
  contactPhone: string;

  @IsOptional()
  status?: 'ACTIVE' | 'SUSPENDED';
}
