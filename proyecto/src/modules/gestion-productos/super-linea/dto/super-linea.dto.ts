import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString } from 'class-validator';

export class SuperLineaDto {
  @ApiProperty({ example: 1, description: 'ID de la superlínea' })
  @Type(() => Number)
  @IsInt()
  id: number;

  @ApiProperty({ example: 'Bebidas', description: 'Denominación o nombre de la superlínea' })
  @IsString()
  denominacion: string;

  @ApiProperty({ example: 'Todas las bebidas sin alcohol', description: 'Observaciones sobre la superlínea' })
  @IsString()
  observacion: string;

  @ApiProperty({ example: 0, description: 'Si es 1, es de sistema y no se puede editar ni eliminar' })
  @Type(() => Number)
  @IsInt()
  sistema: number;

  @ApiProperty({ example: null, description: 'Fecha de eliminación (null si está activa)', nullable: true })
  @IsOptional()
  deletedAt: string | null;
}
