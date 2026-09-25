import { Logger } from '@nestjs/common';
import { Producto } from '../domain/entities/producto.entity';
import { GetProductoDto } from '../dto/get-producto.dto';
import { UpdatePrecioDto } from '../dto/update-precio.dto';
import { UpdateProductoDto } from '../dto/update-producto.dto';
import { CreateProductoDto } from '../dto/create-producto.dto';
import { Usuario } from 'src/modules/gestion-usuario/usuario/domain/entities/usuario.entity';
import { Linea } from '../../linea/domain/entities/linea.entity';
import { Marca } from '../../marca/domain/entities/marca.entity';
import { Denominacion } from '../domain/value-objects/denominacion.vo';
import { UnidadMedida } from '../domain/enums/unidad-medida.enum';
import { Costo } from '../domain/value-objects/costo.vo';
import { Porcentaje } from '../domain/value-objects/porcentaje.vo';
import { ProductoDto } from '../dto/producto.dto';

import {
  toReferenciaDto,
} from 'src/modules/common/utils/mappers/referencia.mapper';

export class ProductoMapper {
 
  private static readonly logger = new Logger(ProductoMapper.name);

  static toNewEntity(
    dto: CreateProductoDto,
    linea: Linea,
    marca: Marca,
    usuario: Usuario,
    denominacionResuelta?: string,
    denominacionManual?: boolean,
  ): Producto {
    const denominacion = new Denominacion(
      denominacionResuelta ?? dto.denominacion,
    );
    const costo = new Costo(dto.costo ?? 0);
    const porcentaje = new Porcentaje(dto.porcentaje ?? 0);

    return Producto.crear({
      denominacion,
      costo,
      porcentaje,
      codigoProveedor: dto.codigoProveedor,
      codigoBarra: dto.codigoBarra,
      codigoReferencia: dto.codigoReferencia,
      alicuotaIva: dto.alicuotaIva,
      stock: dto.stock,
      utilizaStockMinimo: dto.utilizaStockMinimo,
      utilizaStockMinimoPorEmpresa: false, // No está en el DTO, valor por defecto
      stockMinimo: dto.stockMinimo,
      costoDolar: dto.costoDolar,
      cotizacionDolar: undefined, // No está en el DTO
      precioDolar: undefined, // No está en el DTO
      fechaCosto: dto.createdAt,
      costoEnDolar: dto.costoEnDolar,
      fechaCostoDolar: undefined, // No está en el DTO
      destacado: dto.destacado,
      envioGratis: dto.envioGratis,
      observacion: dto.observacion,
      linea,
      marca,
      usuarioCreated: usuario,
      utilizaPack: dto.utilizaPack,
      cantidadPorPack: dto.cantidadPorPack,
      imagen: undefined, // No está en el DTO
      ubicacion: dto.ubicacion,
      sistema: 0,
      denominacionManual,
      presentacionCantidad: dto.presentacionCantidad,
      presentacionUnidadMedida: dto.presentacionUnidadMedida,
    });
  }

  static toCambiosActualizacion(
    dto: UpdateProductoDto,
    linea: Linea,
    marca: Marca,
    usuario: Usuario,
    denominacionResuelta?: string,
    denominacionManual?: boolean,
    presentacionCantidad?: number | null,
    presentacionUnidadMedida?: UnidadMedida | null,
  ) {
    return {
      denominacion:
        (denominacionResuelta ?? dto.denominacion) !== undefined
          ? new Denominacion(denominacionResuelta ?? dto.denominacion)
          : undefined,
      denominacionManual,
      costo: dto.costo !== undefined ? new Costo(dto.costo) : undefined,
      porcentaje:
        dto.porcentaje !== undefined ? new Porcentaje(dto.porcentaje) : undefined,
      codigoProveedor: dto.codigoProveedor,
      codigoBarra: dto.codigoBarra,
      codigoReferencia: dto.codigoReferencia,
      alicuotaIva: dto.alicuotaIva,
      stock: dto.stock,
      utilizaStockMinimo: dto.utilizaStockMinimo,
      utilizaStockMinimoPorEmpresa: undefined, // No está en el DTO
      stockMinimo: dto.stockMinimo,
      costoDolar: dto.costoDolar,
      cotizacionDolar: undefined, // No está en el DTO
      precioDolar: undefined, // No está en el DTO
      fechaCosto: undefined, // No está en el DTO
      costoEnDolar: dto.costoEnDolar,
      fechaCostoDolar: undefined, // No está en el DTO
      destacado: dto.destacado,
      envioGratis: dto.envioGratis,
      observacion: dto.observacion,
      linea: dto.lineaId !== undefined ? linea : undefined,
      marca: dto.marcaId !== undefined ? marca : undefined,
      usuarioUpdated: usuario,
      utilizaPack: dto.utilizaPack,
      cantidadPorPack: dto.cantidadPorPack,
      imagen: undefined, // No está en el DTO
      ubicacion: dto.ubicacion,
      presentacionCantidad,
      presentacionUnidadMedida,
    };
  }

  static toBusquedaDto(entity: Producto): GetProductoDto {
    const precio = entity.precio ?? 0;
    const alicuota = entity.alicuotaIva ?? 0;

    return {
      id: entity.id,
      denominacion: entity.denominacion,
      denominacionManual: entity.denominacionManual,
      observacion: entity.observacion ?? '',
      codigoProveedorDenominacion:
        entity.codigoProveedor + ' - ' + entity.denominacion,

      codigoProveedor: entity.codigoProveedor ?? '',

      proveedor: '',
      stock: entity.stock,
      alicuota: alicuota,
      costo: entity.costo ?? 0,


      precio: precio,
      precioConIva: +(precio * (1 + alicuota / 100)).toFixed(2),
      ubicacion: entity.ubicacion ?? '',

      utilizaStockMinimo: entity.utilizaStockMinimo,

      stockMinimo: entity.stockMinimo,
      utilizaPack: entity.utilizaPack,
      cantidadPorPack: entity.cantidadPorPack ?? 0,
      presentacionCantidad: entity.presentacionCantidad ?? undefined,
      presentacionUnidadMedida:
        (entity.presentacionUnidadMedida as GetProductoDto['presentacionUnidadMedida']) ??
        undefined,
      sistema: entity.sistema,
      codigoReferencia: entity.codigoReferencia ?? '',

    };
  }


  static mapPrecios(
    entity: Producto,
    dto: UpdatePrecioDto,
    usuario: Usuario,
  ): void {
    entity.costo = dto.costo;
    entity.costoDolar = dto.costoDolar;
    entity.cotizacionDolar = dto.cotizacionDolar;

    entity.fechaCostoDolar = new Date();
    entity.fechaCosto = new Date();

    entity.usuarioUpdated = usuario;
  }


  static toDto(entity: Producto): ProductoDto {
   
    const alicuota = entity.alicuotaIva ?? 0;
    const precio = entity.precio ?? 0;

    return {
      id: entity.id,
      denominacion: entity.denominacion,
      denominacionManual: entity.denominacionManual,
      observacion: entity.observacion ?? '',
      codigoProveedor: entity.codigoProveedor ?? '',
      codigoBarra: entity.codigoBarra ?? '',
      stock: entity.stock ?? 0,
      costo: entity.costo ?? 0,
      precio: entity.precio ?? 0,
      porcentaje: entity.porcentaje ?? 0,
      costoEnDolar: entity.costoEnDolar ?? false,
      costoDolar: entity.costoDolar ?? 0,
      cotizacionDolar: entity.cotizacionDolar ?? 0,
      precioDolar: entity.precioDolar ?? 0,

      destacado: entity.destacado ?? false,

      envioGratis: entity.envioGratis ?? false,
      linea: toReferenciaDto(entity.linea),
      marca: toReferenciaDto(entity.marca),
      alicuotaIva: entity.alicuotaIva,
      ubicacion: entity.ubicacion ?? '',
      utilizaStockMinimo: entity.utilizaStockMinimo ?? false,
      stockMinimo: entity.stockMinimo ?? 0,
      utilizaPack: entity.utilizaPack ?? false,
      cantidadPorPack: entity.cantidadPorPack ?? 0,
      presentacionCantidad: entity.presentacionCantidad ?? undefined,
      presentacionUnidadMedida:
        (entity.presentacionUnidadMedida as ProductoDto['presentacionUnidadMedida']) ??
        undefined,
      sistema: entity.sistema,
      codigoReferencia: entity.codigoReferencia ?? '',

    
      
    };
  }


   
}
