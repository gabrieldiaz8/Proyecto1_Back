import { Injectable } from '@nestjs/common';
import { HistorialPrecio } from '../../domain/entities/historial-precio.entity';
import { IHistorialPrecioRepository } from '../../domain/interfaces/historial-precio.repository.interface';
import { HistorialPrecioPersistenceAdapter } from './historial-precio.persistence-adapter';

@Injectable()
export class HistorialPrecioRepository implements IHistorialPrecioRepository {
  constructor(
    private readonly adapter: HistorialPrecioPersistenceAdapter,
  ) {}

  save(
    productoId: number,
    precioAnterior: number,
    precioNuevo: number,
    motivo: string,
  ): Promise<HistorialPrecio> {
    return this.adapter.save(productoId, precioAnterior, precioNuevo, motivo);
  }

  findByProducto(
    productoId: number,
    skip: number,
    take: number,
  ): Promise<{ data: HistorialPrecio[]; total: number }> {
    return this.adapter.findByProducto(productoId, skip, take);
  }
}
