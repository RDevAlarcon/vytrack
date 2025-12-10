// src/locations/locations.module.ts
import { Module } from '@nestjs/common';
import { LocationsService } from './locations.service';
import { LocationsController } from './locations.controller';
import { LocationCleanupService } from './location-cleanup.service';

@Module({
  controllers: [LocationsController],
  providers: [LocationsService, LocationCleanupService],
})
export class LocationsModule {}
