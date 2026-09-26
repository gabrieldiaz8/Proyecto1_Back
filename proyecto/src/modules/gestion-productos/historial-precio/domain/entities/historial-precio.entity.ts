import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { MonetarioColumn } from 'src/modules/common/decorators/monetario-column.decorator';
import { Producto } from '../../../producto/domain/entities/producto.entity';

@Entity('historial_precio')
export class HistorialPrecio {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty()
  @MonetarioColumn()
  precioAnterior: number;

  @ApiProperty()
  @MonetarioColumn()
  precioNuevo: number;

  @ApiProperty()
  @Column({ type: 'text' })
  motivo: string;

  @ApiProperty()
  @CreateDateColumn()
  fechaCambio: Date;

  // FK a Producto — sin cascada, el historial sobrevive al soft-delete del
  // producto. La relación es la única declaración de la FK: la columna real
  // es producto_id (migración CreateHistorialPrecio). Antes se declaraba
  // además una columna "productoId", que no existe en la tabla, y TypeORM
  // fallaba con "Unknown column 'HistorialPrecio.productoId'" en toda
  // lectura o escritura sobre esta entidad.
  @ManyToOne(() => Producto, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'producto_id' })
  producto: Producto;
}
