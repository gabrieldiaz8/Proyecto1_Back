import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HistorialPrecio } from './domain/entities/historial-precio.entity';
import { HistorialPrecioPersistenceAdapter } from './infraestructure/repositories/historial-precio.persistence-adapter';
import { HistorialPrecioRepository } from './infraestructure/repositories/historial-precio.repository';
import { HistorialPrecioService } from './application/services/historial-precio.service';

@Module({
  imports: [TypeOrmModule.forFeature([HistorialPrecio])],
  controllers: [],
  providers: [
    HistorialPrecioService,
    HistorialPrecioPersistenceAdapter,
    {
      provide: 'IHistorialPrecioRepository',
      useClass: HistorialPrecioRepository,
    },
  ],
  exports: [HistorialPrecioService, 'IHistorialPrecioRepository'],
})
export class HistorialPrecioModule {}
