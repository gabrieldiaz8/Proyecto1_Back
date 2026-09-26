import { HistorialPrecio } from '../domain/entities/historial-precio.entity';
import { GetHistorialPrecioDto } from '../dto/get-historial-precio.dto';

export class HistorialPrecioMapper {
  static toDto(entity: HistorialPrecio): GetHistorialPrecioDto {
    return {
      id: entity.id,
      precioAnterior: entity.precioAnterior,
      precioNuevo: entity.precioNuevo,
      motivo: entity.motivo,
      fechaCambio: entity.fechaCambio,
      // La entidad ya no expone productoId: sale de la relación, que el
      // repositorio carga en findByProducto.
      productoId: entity.producto?.id,
    };
  }
}
