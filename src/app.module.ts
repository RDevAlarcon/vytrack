import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { CompaniesModule } from './companies/companies.module';
import { UsersModule } from './users/users.module';
import { VehiclesModule } from './vehicles/vehicles.module';
import { DriversModule } from './drivers/drivers.module';
import { AssignmentsModule } from './assignments/assignments.module';
import { LocationsModule } from './locations/locations.module';
import { AlertsModule } from './alerts/alerts.module';
import { SubscriptionsModule } from './subscriptions/subscriptions.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    CompaniesModule,
    UsersModule,
    VehiclesModule,
    DriversModule,
    AssignmentsModule,
    LocationsModule,
    AlertsModule,
    SubscriptionsModule,
  ],
})
export class AppModule {}
