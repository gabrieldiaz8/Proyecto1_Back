import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  Index,
  JoinColumn,
} from 'typeorm';
import { BadRequestException } from '@nestjs/common';
import { Linea } from '../../../linea/domain/entities/linea.entity';
import { Marca } from '../../../marca/domain/entities/marca.entity';
import { AlicuotaIva } from 'src/modules/organizacion/enums/alicuota-iva.enum';
import { ApiProperty } from '@nestjs/swagger';
import { ProductoOperacion } from '../../../producto-operacion/entities/producto-operacion.entity';
import { Usuario } from 'src/modules/gestion-usuario/usuario/domain/entities/usuario.entity';
import { MonetarioColumn } from 'src/modules/common/decorators/monetario-column.decorator';
import { CantidadColumn } from 'src/modules/common/decorators/cantidad-column.decorator';
import { PorcentajeColumn } from 'src/modules/common/decorators/porcentaje-column.decorator';
import { Proveedor } from 'src/modules/organizacion/proveedor/domain/entities/proveedor.entity';
import { Denominacion } from '../value-objects/denominacion.vo';
import { Costo } from '../value-objects/costo.vo';
import { Porcentaje } from '../value-objects/porcentaje.vo';
import { Precio } from '../value-objects/precio.vo';
import { UnidadMedida } from '../enums/unidad-medida.enum';
import { Presentacion } from '../value-objects/presentacion.vo';

@Entity('producto')
export class Producto {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty()
  @Column({ type: 'text' })
  denominacion: string;

  @Column({ name: 'denominacion_manual', type: 'boolean', default: false })
  denominacionManual: boolean;

  establecerDenominacionManual(manual: boolean): void {
    this.denominacionManual = manual;
  }

  @Index()
  @Column({ type: 'varchar', length: 255, nullable: true })
  codigoProveedor?: string | null;

  @Column({ type: 'text', nullable: true })
  codigoBarra?: string | null;

  // ========== PROVEEDOR ==========
  @ManyToOne(() => Proveedor, (pro) => pro.proveedoresOperacion, {
    eager: true,
  })
  @JoinColumn({ name: 'proveedor_id' })
  @Index()
  proveedor: Proveedor;

  @Column({ type: 'int', nullable: true })
  proveedorId?: number;

  /*
  Nota: No usar el enum alciculta iva en @Column
        sino no anda el importar precios 
  */
  @PorcentajeColumn(21.0)
  alicuotaIva: AlicuotaIva;

  // Stock: cantidades reales, admite fracciones (1.5 kg, 0.25 lts)
  @CantidadColumn()
  stock: number;

  @Column('boolean', { default: false })
  utilizaStockMinimo: boolean;

  @Column('boolean', { default: false })
  utilizaStockMinimoPorEmpresa: boolean;

  @CantidadColumn()
  stockMinimo: number;

  @MonetarioColumn()
  costo?: number;

  @MonetarioColumn()
  costoDolar?: number;

  /*
  Ultima cotizacion dolar por el cambio de precio si producto posee costo dolar
  */
  @MonetarioColumn()
  cotizacionDolar?: number;
  //se utiliza en las importaciones;

  @MonetarioColumn()
  precioDolar?: number;
  // Precio de venta

  @MonetarioColumn()
  precio?: number;

  @PorcentajeColumn()
  porcentaje?: number;

  @Column({ type: 'timestamp', nullable: true })
  fechaCosto?: Date;

  @Column('boolean', { default: false })
  costoEnDolar?: boolean;

  @Column({ type: 'timestamp', nullable: true })
  fechaCostoDolar?: Date;

  @Column('boolean', { default: false })
  destacado?: boolean;

  @Column('boolean', { default: false })
  envioGratis?: boolean;

  @Column({ type: 'text', nullable: true })
  observacion?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  @Index()
  deletedAt?: Date;

  @ManyToOne(() => Usuario)
  @JoinColumn({ name: 'usuario_created_id' })
  usuarioCreated: Usuario;

  @ManyToOne(() => Usuario)
  @JoinColumn({ name: 'usuario_updated_id' })
  usuarioUpdated: Usuario;

  @ManyToOne(() => Usuario)
  @JoinColumn({ name: 'usuario_deleted_id' })
  usuarioDeleted: Usuario;


  // ========== LINEA ==========
  @ManyToOne(() => Linea, (linea) => linea.productos)
  @JoinColumn({ name: 'linea_id' })
  linea: Linea;

  @Column({ type: 'int', nullable: true })
  lineaId?: number;

  // ==========  MARCA ==========
  @ManyToOne(() => Marca, (marca) => marca.productos)
  @JoinColumn({ name: 'marca_id' })
  marca: Marca;

  @Column({ type: 'int', nullable: true })
  marcaId?: number;


  @Column({ default: false })
  utilizaPack: boolean;

  @Column({ type: 'int', nullable: true })
  cantidadPorPack: number | null;

  // ========== PRESENTACION ==========
  @Column({
    name: 'presentacion_cantidad',
    type: 'decimal',
    precision: 12,
    scale: 3,
    nullable: true,
    transformer: {
      to: (value: number | string | null | undefined): string | null =>
        value === null || value === undefined ? null : value.toString(),
      from: (value: string | null): number | null =>
        value === null ? null : Number(value),
    },
  })
  presentacionCantidad?: number | null;

  @Column({
    name: 'presentacion_unidad_medida',
    type: 'varchar',
    length: 20,
    nullable: true,
  })
  presentacionUnidadMedida?: UnidadMedida | null;

  setPresentacion(cantidad: number, unidadMedida: UnidadMedida): void {
    const presentacion = new Presentacion(cantidad, unidadMedida);
    this.presentacionCantidad = presentacion.cantidad;
    this.presentacionUnidadMedida = presentacion.unidadMedida;
  }

  limpiarPresentacion(): void {
    this.presentacionCantidad = null;
    this.presentacionUnidadMedida = null;
  }

  getPresentacion(): Presentacion | null {
    if (
      this.presentacionCantidad === null ||
      this.presentacionCantidad === undefined ||
      this.presentacionUnidadMedida === null ||
      this.presentacionUnidadMedida === undefined
    ) {
      return null;
    }

    return new Presentacion(
      this.presentacionCantidad,
      this.presentacionUnidadMedida,
    );
  }

  getPresentacionDescripcion(): string | null {
    const presentacion = this.getPresentacion();
    return presentacion ? presentacion.getDescripcionFormateada() : null;
  }

  @Column({ type: 'text', nullable: true })
  imagen?: string;


  @Column({ type: 'text', nullable: true })
  ubicacion?: string;

  @ManyToOne(() => Producto, (producto) => producto.productosOperacion)
  productosOperacion: ProductoOperacion;


  @Column({ type: 'int', default: 0 })
  sistema: number;

  @Column({ type: 'text', nullable: true })
  codigoReferencia?: string | null;

// ========== CR-001: MÉTODOS DE CREACIÓN Y ACTUALIZACIÓN CON VOS ==========

  static crear(datos: {
    denominacion: Denominacion;
    costo: Costo;
    porcentaje: Porcentaje;
    codigoProveedor?: string;
    codigoBarra?: string;
    codigoReferencia?: string;
    alicuotaIva: AlicuotaIva;
    stock?: number;
    utilizaStockMinimo: boolean;
    utilizaStockMinimoPorEmpresa?: boolean;
    stockMinimo?: number;
    costoDolar?: number;
    cotizacionDolar?: number;
    precioDolar?: number;
    fechaCosto?: Date;
    costoEnDolar?: boolean;
    fechaCostoDolar?: Date;
    destacado?: boolean;
    envioGratis?: boolean;
    observacion?: string;
    linea: Linea;
    marca: Marca;
    usuarioCreated: Usuario;
    utilizaPack: boolean;
    cantidadPorPack?: number | null;
    imagen?: string;
    ubicacion?: string;
    sistema?: number;
    denominacionManual?: boolean;
    presentacionCantidad: number;
    presentacionUnidadMedida: UnidadMedida;
  }): Producto {
    const producto = new Producto();

    // VOs → primitivos
    producto.denominacion = datos.denominacion.valor;
    producto.costo = datos.costo.valor;
    producto.porcentaje = datos.porcentaje.valor;

    // Calcular precio usando VOs
    const precioCalculado = Precio.calcular(datos.costo, datos.porcentaje);
    producto.precio = precioCalculado.valor;

    // Resto de campos del DTO
    producto.denominacionManual =
      datos.denominacionManual ?? false;
    producto.codigoProveedor = datos.codigoProveedor ?? null;
    producto.codigoBarra = datos.codigoBarra ?? null;
    producto.codigoReferencia = datos.codigoReferencia ?? null;
    producto.alicuotaIva = datos.alicuotaIva;
    producto.stock = datos.stock ?? 0;
    producto.utilizaStockMinimo = datos.utilizaStockMinimo;
    producto.utilizaStockMinimoPorEmpresa = datos.utilizaStockMinimoPorEmpresa ?? false;
    producto.stockMinimo = datos.stockMinimo ?? 0;
    producto.costoDolar = datos.costoDolar;
    producto.cotizacionDolar = datos.cotizacionDolar;
    producto.precioDolar = datos.precioDolar;
    producto.fechaCosto = datos.fechaCosto;
    producto.costoEnDolar = datos.costoEnDolar ?? false;
    producto.fechaCostoDolar = datos.fechaCostoDolar;
    producto.destacado = datos.destacado ?? false;
    producto.envioGratis = datos.envioGratis ?? false;
    producto.observacion = datos.observacion;
    producto.utilizaPack = datos.utilizaPack;
    producto.cantidadPorPack = datos.cantidadPorPack ?? null;
    producto.imagen = datos.imagen;
    producto.ubicacion = datos.ubicacion;
    producto.sistema = datos.sistema ?? 0;
    producto.setPresentacion(
      datos.presentacionCantidad,
      datos.presentacionUnidadMedida,
    );

    // Relaciones (ya resueltas en el service)
    producto.linea = datos.linea;
    producto.lineaId = datos.linea?.id;
    producto.marca = datos.marca;
    producto.marcaId = datos.marca?.id;
    producto.usuarioCreated = datos.usuarioCreated;

    return producto;
  }

  actualizarDatos(datos: {
    denominacion?: Denominacion;
    costo?: Costo;
    porcentaje?: Porcentaje;
    codigoProveedor?: string;
    codigoBarra?: string;
    codigoReferencia?: string;
    alicuotaIva?: AlicuotaIva;
    stock?: number;
    utilizaStockMinimo?: boolean;
    utilizaStockMinimoPorEmpresa?: boolean;
    stockMinimo?: number;
    costoDolar?: number;
    cotizacionDolar?: number;
    precioDolar?: number;
    fechaCosto?: Date;
    costoEnDolar?: boolean;
    fechaCostoDolar?: Date;
    destacado?: boolean;
    envioGratis?: boolean;
    observacion?: string;
    linea?: Linea;
    marca?: Marca;
    usuarioUpdated?: Usuario;
    utilizaPack?: boolean;
    cantidadPorPack?: number | null;
    imagen?: string;
    ubicacion?: string;
    denominacionManual?: boolean;
    presentacionCantidad?: number | null;
    presentacionUnidadMedida?: UnidadMedida | null;
  }): void {
    // Actualizar solo los campos que vengan definidos
    if (datos.denominacion !== undefined) {
      this.denominacion = datos.denominacion.valor;
    }
    if (datos.denominacionManual !== undefined) {
      this.denominacionManual = datos.denominacionManual;
    }

    // Manejo especial de costo/porcentaje/precio
    const costoVino = datos.costo !== undefined;
    const porcentajeVino = datos.porcentaje !== undefined;

    if (costoVino) {
      this.costo = datos.costo!.valor;
    }
    if (porcentajeVino) {
      this.porcentaje = datos.porcentaje!.valor;
    }

    // Recalcular precio solo si vino al menos uno de costo o porcentaje
    if (costoVino || porcentajeVino) {
      const costoParaCalculo = costoVino
        ? datos.costo!
        : new Costo(this.costo ?? 0);
      const porcentajeParaCalculo = porcentajeVino
        ? datos.porcentaje!
        : new Porcentaje(this.porcentaje ?? 0);

      const precioCalculado = Precio.calcular(costoParaCalculo, porcentajeParaCalculo);
      this.precio = precioCalculado.valor;
    }

    // Resto de campos opcionales
    if (datos.codigoProveedor !== undefined) {
      this.codigoProveedor = datos.codigoProveedor;
    }
    if (datos.codigoBarra !== undefined) {
      this.codigoBarra = datos.codigoBarra;
    }
    if (datos.codigoReferencia !== undefined) {
      this.codigoReferencia = datos.codigoReferencia;
    }
    if (datos.alicuotaIva !== undefined) {
      this.alicuotaIva = datos.alicuotaIva;
    }
    if (datos.stock !== undefined) {
      this.stock = datos.stock;
    }
    if (datos.utilizaStockMinimo !== undefined) {
      this.utilizaStockMinimo = datos.utilizaStockMinimo;
    }
    if (datos.utilizaStockMinimoPorEmpresa !== undefined) {
      this.utilizaStockMinimoPorEmpresa = datos.utilizaStockMinimoPorEmpresa;
    }
    if (datos.stockMinimo !== undefined) {
      this.stockMinimo = datos.stockMinimo;
    }
    if (datos.costoDolar !== undefined) {
      this.costoDolar = datos.costoDolar;
    }
    if (datos.cotizacionDolar !== undefined) {
      this.cotizacionDolar = datos.cotizacionDolar;
    }
    if (datos.precioDolar !== undefined) {
      this.precioDolar = datos.precioDolar;
    }
    if (datos.fechaCosto !== undefined) {
      this.fechaCosto = datos.fechaCosto;
    }
    if (datos.costoEnDolar !== undefined) {
      this.costoEnDolar = datos.costoEnDolar;
    }
    if (datos.fechaCostoDolar !== undefined) {
      this.fechaCostoDolar = datos.fechaCostoDolar;
    }
    if (datos.destacado !== undefined) {
      this.destacado = datos.destacado;
    }
    if (datos.envioGratis !== undefined) {
      this.envioGratis = datos.envioGratis;
    }
    if (datos.observacion !== undefined) {
      this.observacion = datos.observacion;
    }
    if (datos.utilizaPack !== undefined) {
      this.utilizaPack = datos.utilizaPack;
    }
    if (datos.cantidadPorPack !== undefined) {
      this.cantidadPorPack = datos.cantidadPorPack;
    }
    if (datos.imagen !== undefined) {
      this.imagen = datos.imagen;
    }
    if (datos.ubicacion !== undefined) {
      this.ubicacion = datos.ubicacion;
    }
    if (
      datos.presentacionCantidad !== undefined ||
      datos.presentacionUnidadMedida !== undefined
    ) {
      const cantidad = datos.presentacionCantidad;
      const unidadMedida = datos.presentacionUnidadMedida;

      if (cantidad === null && unidadMedida === null) {
        this.limpiarPresentacion();
      } else if (
        cantidad === null ||
        cantidad === undefined ||
        unidadMedida === null ||
        unidadMedida === undefined
      ) {
        throw new BadRequestException(
          'La cantidad y la unidad de medida de la presentación deben enviarse juntas',
        );
      } else {
        this.setPresentacion(cantidad, unidadMedida);
      }
    }

    // Relaciones
    if (datos.linea !== undefined) {
      this.linea = datos.linea;
      this.lineaId = datos.linea?.id;
    }
    if (datos.marca !== undefined) {
      this.marca = datos.marca;
      this.marcaId = datos.marca?.id;
    }
    if (datos.usuarioUpdated !== undefined) {
      this.usuarioUpdated = datos.usuarioUpdated;
    }
  }

  cambiarPrecio(nuevoPrecio: number | undefined | null): void {
    if (nuevoPrecio === undefined || nuevoPrecio === null) return;
    if (nuevoPrecio <= 0) {
      throw new BadRequestException('El precio resultante debe ser mayor a 0.');
    }
    this.precio = nuevoPrecio;
  }

  // ========== AJUSTE MASIVO DE PRECIOS ==========

  aumentarPrecioPorMonto(monto: number): void {
    this.validarValorAjuste(monto);
    const nuevoPrecio = (this.precio ?? 0) + monto;
    this.actualizarPrecioManteniendoMargen(nuevoPrecio);
  }

  disminuirPrecioPorMonto(monto: number): void {
    this.validarValorAjuste(monto);
    const nuevoPrecio = (this.precio ?? 0) - monto;
    this.actualizarPrecioManteniendoMargen(nuevoPrecio);
  }

  aumentarPrecioPorPorcentaje(porcentaje: number): void {
    this.validarValorAjuste(porcentaje);
    const nuevoPrecio = (this.precio ?? 0) * (1 + porcentaje / 100);
    this.actualizarPrecioManteniendoMargen(nuevoPrecio);
  }

  disminuirPrecioPorPorcentaje(porcentaje: number): void {
    this.validarValorAjuste(porcentaje);
    const nuevoPrecio = (this.precio ?? 0) * (1 - porcentaje / 100);
    this.actualizarPrecioManteniendoMargen(nuevoPrecio);
  }

  private validarValorAjuste(valor: number): void {
    this.asegurarValorPositivo(valor, 'El valor del ajuste debe ser mayor que 0.');
  }

  private actualizarPrecioManteniendoMargen(nuevoPrecio: number): void {
    this.asegurarValorPositivo(nuevoPrecio, 'El precio final debe ser mayor que 0.');
    const margenActual = this.porcentaje ?? 0;
    const costoRecalculado =
      margenActual === 0
        ? nuevoPrecio
        : nuevoPrecio / (1 + margenActual / 100);
    this.asegurarValorPositivo(costoRecalculado, 'El costo recalculado debe ser mayor que 0.');
    this.precio = nuevoPrecio;
    this.costo = costoRecalculado;
  }

  private asegurarValorPositivo(valor: number, mensaje: string): void {
    if (!Number.isFinite(valor) || valor <= 0) {
      throw new Error(mensaje);
    }
  }
}

