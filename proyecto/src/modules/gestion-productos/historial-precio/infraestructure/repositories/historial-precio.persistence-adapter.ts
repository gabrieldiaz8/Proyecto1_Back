import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HistorialPrecio } from '../../domain/entities/historial-precio.entity';
import { IHistorialPrecioRepository } from '../../domain/interfaces/historial-precio.repository.interface';

@Injectable()
export class HistorialPrecioPersistenceAdapter
  implements IHistorialPrecioRepository
{
  constructor(
    @InjectRepository(HistorialPrecio)
    private readonly repository: Repository<HistorialPrecio>,
  ) {}

  async save(
    productoId: number,
    precioAnterior: number,
    precioNuevo: number,
    motivo: string,
  ): Promise<HistorialPrecio> {
    const registro = this.repository.create({
      productoId,
      precioAnterior,
      precioNuevo,
      motivo,
    });
    return this.repository.save(registro);
  }

  async findByProducto(
    productoId: number,
    skip: number,
    take: number,
  ): Promise<{ data: HistorialPrecio[]; total: number }> {
    const [data, total] = await this.repository.findAndCount({
      where: { productoId },
      order: { fechaCambio: 'DESC' },
      skip,
      take,
    });
    return { data, total };
  }
}
