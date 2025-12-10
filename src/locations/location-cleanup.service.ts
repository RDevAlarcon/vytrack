import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

// Limpia ubicaciones antiguas cada 7 días, borrando todo lo anterior a 5 días.
@Injectable()
export class LocationCleanupService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(LocationCleanupService.name);
  private intervalHandle?: NodeJS.Timeout;
  private readonly weekMs = 7 * 24 * 60 * 60 * 1000;
  private readonly retentionMs = 5 * 24 * 60 * 60 * 1000; // borra >5 días

  constructor(private readonly prisma: PrismaService) {}

  onModuleInit() {
    // Programa limpieza semanal
    this.intervalHandle = setInterval(() => {
      void this.cleanup();
    }, this.weekMs);
    // Opcional: primera limpieza al arrancar (no bloqueante)
    void this.cleanup();
  }

  onModuleDestroy() {
    if (this.intervalHandle) clearInterval(this.intervalHandle);
  }

  private async cleanup() {
    try {
      const cutoff = new Date(Date.now() - this.retentionMs);
      const result = await this.prisma.location.deleteMany({
        where: { timestamp: { lt: cutoff } },
      });
      this.logger.log(`Location cleanup executed. Deleted: ${result.count}`);
    } catch (err) {
      this.logger.error('Location cleanup failed', err instanceof Error ? err.stack : String(err));
    }
  }
}
