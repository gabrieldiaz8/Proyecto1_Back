import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class UpdatePrecioDto {
  @ApiProperty({ example: 100.5, description: 'Costo en moneda local' })
  @IsNumber()
  @Min(0)
  costo: number;

  @ApiProperty({ example: 50.25, description: 'Costo en dólares' })
  @IsNumber()
  @Min(0)
  costoDolar: number;

  @ApiProperty({ example: 50.25, description: 'Cotización del dólar' })
  @IsNumber()
  @Min(0)
  cotizacionDolar: number;

  @ApiProperty({ example: 10, description: 'Porcentaje de margen' })
  @IsNumber()
  @Min(0)
  porcentaje: number;

  @ApiPropertyOptional({ example: 150.0, description: 'Precio de venta' })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  precio?: number;

  @ApiProperty({ example: 'Ajuste por inflación', description: 'Motivo del cambio de precio' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  motivo: string;

  @ApiProperty({ example: 3, description: 'ID del usuario que realiza la actualización' })
  @IsNumber()
  usuarioId: number;
}
