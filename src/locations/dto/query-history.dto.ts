// src/locations/dto/query-history.dto.ts
import { IsDateString } from 'class-validator';

export class QueryHistoryDto {
  @IsDateString()
  from: string;

  @IsDateString()
  to: string;
}
