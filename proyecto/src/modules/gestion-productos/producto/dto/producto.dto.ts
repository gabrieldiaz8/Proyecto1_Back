import { Transform, Type } from 'class-transformer';
import {
  IsString,
  IsNotEmpty,
  IsBoolean,
  IsNumber,
  IsInt,
  IsEnum,
  IsPositive,
  ValidateNested,
} from 'class-validator';
import { AlicuotaIva } from 'src/modules/organizacion/enums/alicuota-iva.enum';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ReferenciaDto } from 'src/modules/common/dto/referencia.dto';
import { IsOptional } from 'class-validator';
import { UnidadMedida } from '../domain/enums/unidad-medida.enum';
/*
Se Utiliza cuando se necesita la entidad producto
*/
export class ProductoDto {
  @ApiProperty({ example: 123 })
  @Type(() => Number)
  @IsInt()
  id: number;

  @ApiProperty({
    example: 'Caja de tornillos',
    description:
      'Denominación o nombre del producto. Esta formado por la linea y la marca',
  })
  @IsString()
  denominacion: string;

  @ApiProperty()
  @IsString()
  observacion?: string;

  @ApiProperty()
  @IsString()
  codigoProveedor: string;

  @ApiProperty()
  @IsString()
  codigoBarra?: string;

  @ApiProperty()
  @IsInt()
  stock: number;

  @ApiProperty()
  @IsNumber()
  costo: number;

  @ApiProperty()
  @IsNumber()
  precio: number;

  @ApiProperty()
  @IsNumber()
  porcentaje: number;

  @ApiProperty()
  @IsBoolean()
  costoEnDolar: boolean;

  @ApiProperty()
  @IsNumber()
  costoDolar: number;

  @ApiProperty()
  @IsNumber()
  cotizacionDolar: number;

  @Type(() => Number)
  @IsNumber()
  precioDolar: number;

  @ApiProperty()
  @IsBoolean()
  destacado: boolean;

  @ApiProperty()
  @IsBoolean()
  envioGratis: boolean;

  @ApiProperty({
    type: () => ReferenciaDto,
    description: 'Linea asociada al producto',
    required: true,
  })
  @ValidateNested()
  @Type(() => ReferenciaDto)
  linea?: ReferenciaDto;

  @ApiProperty({
    type: () => ReferenciaDto,
    description: 'Marca asociada al producto',
    required: true,
  })
  @ValidateNested()
  @Type(() => ReferenciaDto)
  marca?: ReferenciaDto;


  @ApiProperty({
    type: () => ReferenciaDto,
    description: 'proveedor asociada al producto',
    required: true,
  })
  @ValidateNested()
  @Type(() => ReferenciaDto)
  proveedor?: ReferenciaDto;

  @ApiProperty({
    enum: AlicuotaIva,
    enumName: 'AlicuotaIva',
  })
  @IsEnum(AlicuotaIva)
  @Transform(({ value }) =>
    typeof value === 'string'
      ? AlicuotaIva[value.toUpperCase() as keyof typeof AlicuotaIva]
      : value,
  )
  alicuotaIva: AlicuotaIva;

  @ApiProperty()
  @IsString()
  ubicacion: string;

  @ApiProperty()
  @IsBoolean()
  @IsNotEmpty()
  utilizaStockMinimo: boolean;

  @ApiPropertyOptional()
  @IsInt()
  stockMinimo: number;

  @ApiProperty()
  @IsBoolean()
  @IsNotEmpty()
  utilizaPack: boolean;

  @ApiPropertyOptional()
  @IsInt()
  @IsOptional()
  cantidadPorPack: number;

  @ApiPropertyOptional({ example: 750, description: 'Cantidad de la presentación del producto.' })
  @IsNumber()
  @IsPositive()
  @IsOptional()
  presentacionCantidad?: number;

  @ApiPropertyOptional({
    enum: UnidadMedida,
    enumName: 'UnidadMedida',
    description: 'Unidad de medida de la presentación del producto.',
  })
  @IsEnum(UnidadMedida)
  @IsOptional()
  presentacionUnidadMedida?: UnidadMedida;

  @ApiProperty({ example: 123 })
  @Type(() => Number)
  @IsInt()
  sistema: number;

  @IsString()
  codigoReferencia?: string;

}
