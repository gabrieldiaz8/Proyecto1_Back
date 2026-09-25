import { Producto } from '../entities/producto.entity';
import { IUnitOfWork } from 'src/modules/common/unit-of-work/iunit-of-work.';
import { Usuario } from 'src/modules/gestion-usuario/usuario/domain/entities/usuario.entity';
import { UpdatePrecioDto } from '../../dto/update-precio.dto';

export interface IProductoRepository {

  findOne(id: number): Promise<Producto | null>;
  findByIdConAuditoria(id: number): Promise<Producto | null>;
  findByDenominacion(denominacion: string): Promise<Producto | null>;

  findBy(
    denominacion: string,
    codigoProveedor: string,
    codProveedorExacto: boolean,
    codigoReferencia: string,
    marca_id: number,
    linea_id: number,
    proveedor_id: number,
    conStock: boolean,
    skip: number,
    take: number,
    lineaDenominacion?: string,
    superLineaDenominacion?: string,
  ): Promise<{ data: Producto[]; total: number }>;

  findByRapido(
    codigo: string,
    exacto: boolean,
    skip: any,
    take: number,
  ): Promise<{ data: Producto[]; total: number }>;


  findByIdWithoutRelations(id: number): Promise<Producto | null> | undefined;

  save(producto: Producto): Promise<Producto>;

  updateEntity(uow: IUnitOfWork, data: Producto): Promise<Producto>;

  actualizarPrecio(
    id: number,
    dto: UpdatePrecioDto,
    usuario: Usuario,
  ): Promise<void>;
  remove(data: Producto, usuario: Usuario): Promise<Producto>;

  isCodigoProveedorDuplicado(
    codigoProveedor: string | null,
    id?: number,
  ): Promise<boolean>;

  findByDenominacionCodigoProveedorFiltered(
    denominacion: string,
    skip: number,
    take: number,
  ): Promise<{ data: Producto[]; total: number }>;

  existsByDenominacion(
    denominacion: string,
    excludeId?: number,
  ): Promise<boolean>;
  existsByCodigoProveedor(codigoProveedor: string, excludeId: number): Promise<boolean>;
  existsProductosActivosByMarca(marcaId: number): Promise<boolean>;
  existsProductosActivosByLinea(lineaId: number): Promise<boolean>;

  regenerarDenominacionesPorMarca(
    marcaId: number,
    nuevaDenominacion: string,
  ): Promise<number>;

  regenerarDenominacionesPorLinea(
    lineaId: number,
    nuevaDenominacion: string,
  ): Promise<number>;

  findByIds(ids: number[]): Promise<Producto[]>;

  /** Devuelve todos los productos activos (deletedAt IS NULL). */
  findActivos(): Promise<Producto[]>;

  /** Devuelve los productos activos filtrados por lineaId. */
  findActivosByLinea(lineaId: number): Promise<Producto[]>;

  /** Persiste masivamente un array de entidades Producto. */
  saveMany(productos: Producto[]): Promise<Producto[]>;
}
