import { ProductoMapper } from './producto.mapper';
import { Producto } from '../domain/entities/producto.entity';
import { UnidadMedida } from '../domain/enums/unidad-medida.enum';

describe('ProductoMapper — mapeo de presentación (CR-002, CP-CR002-B-04)', () => {
  function crearProductoConPresentacion(): Producto {
    const producto = new Producto();
    producto.id = 1;
    producto.denominacion = 'Leche larga vida';
    producto.linea = { id: 1, denominacion: 'Lácteos' } as any;
    producto.marca = { id: 1, denominacion: 'La Serenísima' } as any;
    producto.presentacionCantidad = 1.5;
    producto.presentacionUnidadMedida = UnidadMedida.L;
    return producto;
  }

  it('debería mapear correctamente las columnas de presentación en toBusquedaDto', () => {
    const dto = ProductoMapper.toBusquedaDto(crearProductoConPresentacion());

    expect(dto.presentacionCantidad).toBe(1.5);
    expect(dto.presentacionUnidadMedida).toBe(UnidadMedida.L);
  });

  it('debería mapear correctamente las columnas de presentación en toDto', () => {
    const dto = ProductoMapper.toDto(crearProductoConPresentacion());

    expect(dto.presentacionCantidad).toBe(1.5);
    expect(dto.presentacionUnidadMedida).toBe(UnidadMedida.L);
  });

  it('debería exponer undefined de presentación cuando la entidad no tiene presentación', () => {
    const producto = new Producto();
    producto.denominacion = 'Sin presentación';
    producto.linea = { id: 1, denominacion: 'Línea' } as any;
    producto.marca = { id: 1, denominacion: 'Marca' } as any;

    const dto = ProductoMapper.toBusquedaDto(producto);

    expect(dto.presentacionCantidad).toBeUndefined();
    expect(dto.presentacionUnidadMedida).toBeUndefined();
  });
});