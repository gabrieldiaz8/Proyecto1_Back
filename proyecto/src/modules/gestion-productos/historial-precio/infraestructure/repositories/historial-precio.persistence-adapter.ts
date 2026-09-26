import { Injectable } from '@nestjs/common';
import { IUnitOfWork } from 'src/modules/common/unit-of-work/iunit-of-work.';
import { HistorialPrecio } from '../../domain/entities/historial-precio.entity';
import { IHistorialPrecioRepository } from '../../domain/interfaces/historial-precio.repository.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class HistorialPrecioPersistenceAdapter
  implements IHistorialPrecioRepository
{
  constructor(
    @InjectRepository(HistorialPrecio)
    private readonly repository: Repository<HistorialPrecio>,
  ) {}

  async save(
    uow: IUnitOfWork,
    productoId: number,
    precioAnterior: number,
    precioNuevo: number,
    motivo: string,
  ): Promise<HistorialPrecio> {
    const repo = uow.getRepository(HistorialPrecio);
    // La FK se carga por la relación, no por una columna productoId: la tabla
    // solo tiene producto_id.
    const registro = repo.create({
      producto: { id: productoId },
      precioAnterior,
      precioNuevo,
      motivo,
    });
    return repo.save(registro);
  }

  async findByProducto(
    productoId: number,
    skip: number,
    take: number,
  ): Promise<{ data: HistorialPrecio[]; total: number }> {
    const [data, total] = await this.repository.findAndCount({
      where: { producto: { id: productoId } },
      // Necesaria para que el mapper pueda leer producto.id y devolver el
      // productoId del DTO.
      relations: { producto: true },
      order: { fechaCambio: 'DESC' },
      skip,
      take,
    });
    return { data, total };
  }
}
