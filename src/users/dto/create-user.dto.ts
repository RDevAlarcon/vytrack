import { IsBoolean, IsEmail, IsEnum, IsOptional, IsString } from 'class-validator';
import { UserRole } from '@prisma/client';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;

  @IsEnum(UserRole)
  role: UserRole; // debe ser COMPANY_ADMIN o COMPANY_USER en este endpoint

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
