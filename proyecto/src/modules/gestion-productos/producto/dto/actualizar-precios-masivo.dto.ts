import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  ValidateIf,
} from 'class-validator';
import {
  AlcanceAjustePrecio,
  ModalidadAjustePrecio,
  TipoAjustePrecio,
} from '../enums/ajuste-precio.enum';

export class ActualizarPreciosMasivoDto {
  @ApiProperty({
    enum: TipoAjustePrecio,
    example: TipoAjustePrecio.AUMENTO,
    description: 'Define si la operación es un aumento o una disminución de precio.',
  })
  @IsNotEmpty({ message: 'El tipo de ajuste no puede estar vacío.' })
  @IsEnum(TipoAjustePrecio, {
    message: `tipoAjuste debe ser uno de: ${Object.values(TipoAjustePrecio).join(', ')}.`,
  })
  tipoAjuste: TipoAjustePrecio;

  @ApiProperty({
    enum: ModalidadAjustePrecio,
    example: ModalidadAjustePrecio.PORCENTAJE,
    description: 'Define si el ajuste se aplica por porcentaje o por monto fijo.',
  })
  @IsNotEmpty({ message: 'La modalidad no puede estar vacía.' })
  @IsEnum(ModalidadAjustePrecio, {
    message: `modalidad debe ser uno de: ${Object.values(ModalidadAjustePrecio).join(', ')}.`,
  })
  modalidad: ModalidadAjustePrecio;

  @ApiProperty({
    example: 10,
    description: 'Valor numérico positivo a aplicar en el ajuste (porcentaje o monto).',
  })
  @IsNotEmpty({ message: 'El valor del ajuste no puede estar vacío.' })
  @IsNumber({}, { message: 'El valor del ajuste debe ser un número.' })
  @IsPositive({ message: 'El valor del ajuste debe ser mayor que 0.' })
  valor: number;

  @ApiProperty({
    enum: AlcanceAjustePrecio,
    example: AlcanceAjustePrecio.GLOBAL,
    description:
      "Define si el ajuste aplica a todo el catálogo ('GLOBAL') o solo a una línea ('LINEA').",
  })
  @IsNotEmpty({ message: 'El alcance no puede estar vacío.' })
  @IsEnum(AlcanceAjustePrecio, {
    message: `alcance debe ser uno de: ${Object.values(AlcanceAjustePrecio).join(', ')}.`,
  })
  alcance: AlcanceAjustePrecio;

  @ApiPropertyOptional({
    example: 3,
    description:
      "ID de la línea objetivo. Requerido únicamente cuando alcance es 'LINEA'.",
  })
  @ValidateIf((o) => o.alcance === AlcanceAjustePrecio.LINEA)
  @IsNotEmpty({ message: 'El lineaId es obligatorio cuando el alcance es LINEA.' })
  @IsNumber({}, { message: 'El lineaId debe ser un número.' })
  @IsPositive({ message: 'El lineaId debe ser un número positivo.' })
  lineaId?: number;
}
