import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
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

  // FK a Producto — sin cascada, el historial sobrevive al soft-delete del producto
  @ManyToOne(() => Producto, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'producto_id' })
  producto: Producto;

  @ApiProperty()
  @Index()
  @Column({ type: 'int' })
  productoId: number;
}
