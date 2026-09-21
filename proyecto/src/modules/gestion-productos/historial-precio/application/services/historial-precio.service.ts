import { Inject, Injectable, Logger } from '@nestjs/common';
import { IHistorialPrecioRepository } from '../../domain/interfaces/historial-precio.repository.interface';
import { HistorialPrecioMapper } from '../../mappers/historial-precio.mapper';
import { GetHistorialPrecioDto } from '../../dto/get-historial-precio.dto';
import { PaginacionUtils } from 'src/modules/common/utils/pagination/paginacion-utils';

@Injectable()
export class HistorialPrecioService {
  private readonly logger = new Logger(HistorialPrecioService.name);

  constructor(
    @Inject('IHistorialPrecioRepository')
    private readonly repository: IHistorialPrecioRepository,
  ) {}

  async registrar(
    productoId: number,
    precioAnterior: number,
    precioNuevo: number,
    motivo: string,
  ): Promise<void> {
    this.logger.log(
      `Registrando cambio de precio para producto ID ${productoId}: ${precioAnterior} → ${precioNuevo}`,
    );
    await this.repository.save(productoId, precioAnterior, precioNuevo, motivo);
  }

  async findByProducto(
    productoId: number,
    skip: number,
    take: number,
  ): Promise<{ data: GetHistorialPrecioDto[]; total: number }> {
    this.logger.log(
      `Consultando historial de precios para producto ID ${productoId}`,
    );
    const result = await this.repository.findByProducto(productoId, skip, take);
    return {
      data: result.data.map((registro) =>
        HistorialPrecioMapper.toDto(registro),
      ),
      total: PaginacionUtils.totalItems(result.total),
    };
  }
}
