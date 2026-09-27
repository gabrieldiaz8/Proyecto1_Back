import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsPositive, Min } from 'class-validator';

export class SearchHistorialPrecioDto {
  @ApiProperty({ example: 1, description: 'ID del producto' })
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  productoId: number;

  @ApiProperty({ example: 0, description: 'Registros a saltear (paginación)' })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  skip: number = 0;

  @ApiProperty({ example: 10, description: 'Cantidad de registros a traer' })
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  take: number = 10;
}
