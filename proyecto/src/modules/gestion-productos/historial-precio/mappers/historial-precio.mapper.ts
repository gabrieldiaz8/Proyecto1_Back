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
      productoId: entity.productoId,
    };
  }
}
