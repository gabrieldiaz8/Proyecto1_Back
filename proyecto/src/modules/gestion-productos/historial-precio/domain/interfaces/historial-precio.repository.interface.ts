import { HistorialPrecio } from '../entities/historial-precio.entity';

export interface IHistorialPrecioRepository {
  save(
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
