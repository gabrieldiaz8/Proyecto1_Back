import { ApiProperty } from '@nestjs/swagger';

export class GetHistorialPrecioDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  precioAnterior: number;

  @ApiProperty()
  precioNuevo: number;

  @ApiProperty()
  motivo: string;

  @ApiProperty()
  fechaCambio: Date;

  @ApiProperty()
  productoId: number;
}
