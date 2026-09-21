import { Controller, Get, Logger, Query, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from 'src/modules/gestion-usuario/auth/auth.guard';
import { Roles } from 'src/modules/gestion-usuario/auth/roles.decorator';
import { HistorialPrecioService } from '../services/historial-precio.service';
import { SearchHistorialPrecioDto } from '../../dto/search-historial-precio.dto';
import { GetHistorialPrecioDto } from '../../dto/get-historial-precio.dto';

@ApiTags('Gestion Productos')
@Controller('historial-precio')
@UseGuards(AuthGuard)
export class HistorialPrecioController {
  private readonly logger = new Logger(HistorialPrecioController.name);

  constructor(private readonly service: HistorialPrecioService) {}

  @Get()
  @Roles('Root', 'Administrador')
  @ApiOkResponse({ type: GetHistorialPrecioDto, isArray: true })
  findByProducto(
    @Query() searchDto: SearchHistorialPrecioDto,
  ): Promise<{ data: GetHistorialPrecioDto[]; total: number }> {
    const { productoId, skip, take } = searchDto;
    this.logger.log(
      `Consultando historial de precios para producto ID: ${productoId}`,
    );
    return this.service.findByProducto(productoId, skip, take);
  }
}
