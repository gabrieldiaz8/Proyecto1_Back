import { IUnitOfWork } from 'src/modules/common/unit-of-work/iunit-of-work.';
import { HistorialPrecio } from '../entities/historial-precio.entity';

export interface IHistorialPrecioRepository {
  save(
    uow: IUnitOfWork,
    productoId: number,
    precioAnterior: number,
    precioNuevo: number,
    motivo: string,
  ): Promise<HistorialPrecio>;

  findByProducto(
    productoId: number,
    skip: number,
    take: number,
  ): Promise<{ data: HistorialPrecio[]; total: number }>;
}
