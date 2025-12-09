// src/subscriptions/dto/update-company-subscription.dto.ts
import { IsString } from 'class-validator';

export class UpdateCompanySubscriptionDto {
  @IsString()
  planId: string;
}
