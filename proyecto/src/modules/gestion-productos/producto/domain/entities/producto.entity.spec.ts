import { BadRequestException } from '@nestjs/common';
import { Producto } from './producto.entity';
import { Denominacion } from '../value-objects/denominacion.vo';
import { Costo } from '../value-objects/costo.vo';
import { Porcentaje } from '../value-objects/porcentaje.vo';
import { Linea } from '../../../linea/domain/entities/linea.entity';
import { Marca } from '../../../marca/domain/entities/marca.entity';
import { Usuario } from 'src/modules/gestion-usuario/usuario/domain/entities/usuario.entity';
import { AlicuotaIva } from 'src/modules/organizacion/enums/alicuota-iva.enum';
import { UnidadMedida } from '../enums/unidad-medida.enum';

describe('Producto.cambiarPrecio', () => {
  let producto: Producto;

  beforeEach(() => {
    producto = new Producto();
    producto.precio = 100;
  });

  it('asigna el nuevo precio cuando es válido (> 0)', () => {
    producto.cambiarPrecio(150);
    expect(producto.precio).toBe(150);
  });

  it('lanza BadRequestException cuando el precio es 0 y no modifica el precio anterior', () => {
    expect(() => producto.cambiarPrecio(0)).toThrow(BadRequestException);
    expect(producto.precio).toBe(100);
  });

  it('lanza BadRequestException cuando el precio es negativo y no modifica el precio anterior', () => {
    expect(() => producto.cambiarPrecio(-10)).toThrow(BadRequestException);
    expect(producto.precio).toBe(100);
  });

  it('no lanza ni modifica el precio cuando recibe undefined', () => {
    producto.cambiarPrecio(undefined);
    expect(producto.precio).toBe(100);
  });

  it('no lanza ni modifica el precio cuando recibe null', () => {
    producto.cambiarPrecio(null);
    expect(producto.precio).toBe(100);
  });
});

describe('Producto - métodos de ajuste de precio (CR-006)', () => {
  /**
   * Construye una instancia mínima de Producto con los campos
   * necesarios para los tests de ajuste de precio.
   */
  function crearProducto(precio?: number, porcentaje?: number): Producto {
    const producto = new Producto();
    producto.precio = precio;
    producto.porcentaje = porcentaje;
    // costo se reasigna por los métodos; lo inicializamos en 0 para claridad
    producto.costo = 0;
    return producto;
  }

  // =========================================================================
  // aumentarPrecioPorMonto
  // =========================================================================
  describe('aumentarPrecioPorMonto', () => {
    it('debería incrementar el precio correctamente dado un monto válido', () => {
      // precio 1000 + monto 200 = 1200
      const producto = crearProducto(1000, 25);
      producto.aumentarPrecioPorMonto(200);
      expect(producto.precio).toBe(1200);
    });

    it('debería recalcular el costo correctamente tras el aumento por monto', () => {
      // precio 1200, porcentaje 25 → costo = 1200 / (1 + 25/100) = 1200 / 1.25 = 960
      const producto = crearProducto(1000, 25);
      producto.aumentarPrecioPorMonto(200);
      expect(producto.costo).toBeCloseTo(960, 5);
    });

    it('debería lanzar error si el monto es 0', () => {
      const producto = crearProducto(1000, 25);
      expect(() => producto.aumentarPrecioPorMonto(0)).toThrow(
        'El valor del ajuste debe ser mayor que 0.',
      );
    });

    it('debería lanzar error si el monto es negativo', () => {
      const producto = crearProducto(1000, 25);
      expect(() => producto.aumentarPrecioPorMonto(-5)).toThrow(
        'El valor del ajuste debe ser mayor que 0.',
      );
    });

    it('debería lanzar error si el monto es NaN', () => {
      const producto = crearProducto(1000, 25);
      expect(() => producto.aumentarPrecioPorMonto(NaN)).toThrow(
        'El valor del ajuste debe ser mayor que 0.',
      );
    });

    it('debería lanzar error si el monto es Infinity', () => {
      const producto = crearProducto(1000, 25);
      expect(() => producto.aumentarPrecioPorMonto(Infinity)).toThrow(
        'El valor del ajuste debe ser mayor que 0.',
      );
    });
  });

  // =========================================================================
  // disminuirPrecioPorMonto
  // =========================================================================
  describe('disminuirPrecioPorMonto', () => {
    it('debería reducir el precio correctamente dado un monto válido', () => {
      // precio 1000 - monto 200 = 800
      const producto = crearProducto(1000, 25);
      producto.disminuirPrecioPorMonto(200);
      expect(producto.precio).toBe(800);
    });

    it('debería recalcular el costo correctamente tras la disminución por monto', () => {
      // precio 800, porcentaje 25 → costo = 800 / 1.25 = 640
      const producto = crearProducto(1000, 25);
      producto.disminuirPrecioPorMonto(200);
      expect(producto.costo).toBeCloseTo(640, 5);
    });

    it('debería lanzar error si el monto es 0', () => {
      const producto = crearProducto(1000, 25);
      expect(() => producto.disminuirPrecioPorMonto(0)).toThrow(
        'El valor del ajuste debe ser mayor que 0.',
      );
    });

    it('debería lanzar error si el monto es negativo', () => {
      const producto = crearProducto(1000, 25);
      expect(() => producto.disminuirPrecioPorMonto(-5)).toThrow(
        'El valor del ajuste debe ser mayor que 0.',
      );
    });

    it('debería lanzar error si el monto es NaN', () => {
      const producto = crearProducto(1000, 25);
      expect(() => producto.disminuirPrecioPorMonto(NaN)).toThrow(
        'El valor del ajuste debe ser mayor que 0.',
      );
    });

    it('debería lanzar error si el monto es Infinity', () => {
      const producto = crearProducto(1000, 25);
      expect(() => producto.disminuirPrecioPorMonto(Infinity)).toThrow(
        'El valor del ajuste debe ser mayor que 0.',
      );
    });

    it('debería lanzar error si la disminución deja el precio en 0 o negativo', () => {
      // precio 1000 - monto 1500 = -500 → error
      const producto = crearProducto(1000, 25);
      expect(() => producto.disminuirPrecioPorMonto(1500)).toThrow(
        'El precio final debe ser mayor que 0.',
      );
    });
  });

  // =========================================================================
  // aumentarPrecioPorPorcentaje
  // =========================================================================
  describe('aumentarPrecioPorPorcentaje', () => {
    it('debería incrementar el precio correctamente dado un porcentaje válido', () => {
      // precio 1000 * (1 + 10/100) = 1000 * 1.10 = 1100
      const producto = crearProducto(1000, 25);
      producto.aumentarPrecioPorPorcentaje(10);
      expect(producto.precio).toBeCloseTo(1100, 5);
    });

    it('debería recalcular el costo correctamente tras el aumento por porcentaje', () => {
      // precio 1100, porcentaje 25 → costo = 1100 / 1.25 = 880
      const producto = crearProducto(1000, 25);
      producto.aumentarPrecioPorPorcentaje(10);
      expect(producto.costo).toBeCloseTo(880, 5);
    });

    it('debería lanzar error si el porcentaje es 0', () => {
      const producto = crearProducto(1000, 25);
      expect(() => producto.aumentarPrecioPorPorcentaje(0)).toThrow(
        'El valor del ajuste debe ser mayor que 0.',
      );
    });

    it('debería lanzar error si el porcentaje es negativo', () => {
      const producto = crearProducto(1000, 25);
      expect(() => producto.aumentarPrecioPorPorcentaje(-10)).toThrow(
        'El valor del ajuste debe ser mayor que 0.',
      );
    });

    it('debería lanzar error si el porcentaje es NaN', () => {
      const producto = crearProducto(1000, 25);
      expect(() => producto.aumentarPrecioPorPorcentaje(NaN)).toThrow(
        'El valor del ajuste debe ser mayor que 0.',
      );
    });

    it('debería lanzar error si el porcentaje es Infinity', () => {
      const producto = crearProducto(1000, 25);
      expect(() => producto.aumentarPrecioPorPorcentaje(Infinity)).toThrow(
        'El valor del ajuste debe ser mayor que 0.',
      );
    });
  });

  // =========================================================================
  // disminuirPrecioPorPorcentaje
  // =========================================================================
  describe('disminuirPrecioPorPorcentaje', () => {
    it('debería reducir el precio correctamente dado un porcentaje válido', () => {
      // precio 1000 * (1 - 10/100) = 1000 * 0.90 = 900
      const producto = crearProducto(1000, 25);
      producto.disminuirPrecioPorPorcentaje(10);
      expect(producto.precio).toBeCloseTo(900, 5);
    });

    it('debería recalcular el costo correctamente tras la disminución por porcentaje', () => {
      // precio 900, porcentaje 25 → costo = 900 / 1.25 = 720
      const producto = crearProducto(1000, 25);
      producto.disminuirPrecioPorPorcentaje(10);
      expect(producto.costo).toBeCloseTo(720, 5);
    });

    it('debería lanzar error si el porcentaje es 0', () => {
      const producto = crearProducto(1000, 25);
      expect(() => producto.disminuirPrecioPorPorcentaje(0)).toThrow(
        'El valor del ajuste debe ser mayor que 0.',
      );
    });

    it('debería lanzar error si el porcentaje es negativo', () => {
      const producto = crearProducto(1000, 25);
      expect(() => producto.disminuirPrecioPorPorcentaje(-10)).toThrow(
        'El valor del ajuste debe ser mayor que 0.',
      );
    });

    it('debería lanzar error si el porcentaje es NaN', () => {
      const producto = crearProducto(1000, 25);
      expect(() => producto.disminuirPrecioPorPorcentaje(NaN)).toThrow(
        'El valor del ajuste debe ser mayor que 0.',
      );
    });

    it('debería lanzar error si el porcentaje es Infinity', () => {
      const producto = crearProducto(1000, 25);
      expect(() => producto.disminuirPrecioPorPorcentaje(Infinity)).toThrow(
        'El valor del ajuste debe ser mayor que 0.',
      );
    });

    it('debería lanzar error si la disminución deja el precio en 0 o negativo', () => {
      // precio 1000 * (1 - 200/100) = 1000 * (-1) = -1000 → error
      const producto = crearProducto(1000, 25);
      expect(() => producto.disminuirPrecioPorPorcentaje(200)).toThrow(
        'El precio final debe ser mayor que 0.',
      );
    });
  });

  // =========================================================================
  // Casos adicionales transversales
  // =========================================================================
  describe('casos especiales', () => {
    it('debería tratar porcentaje undefined como margen 0 y asignar el costo igual al nuevo precio', () => {
      // margen === 0 → costoRecalculado = nuevoPrecio
      // precio 500 + monto 100 = 600 → costo = 600
      const producto = crearProducto(500, undefined);
      producto.aumentarPrecioPorMonto(100);
      expect(producto.precio).toBe(600);
      expect(producto.costo).toBe(600);
    });

    it('debería tratar precio undefined como precio base 0 al aplicar el ajuste por monto', () => {
      // precio undefined → 0; 0 + 300 = 300
      const producto = crearProducto(undefined, 25);
      producto.aumentarPrecioPorMonto(300);
      expect(producto.precio).toBe(300);
    });

    it('debería tratar precio undefined como precio base 0 al aplicar el ajuste por porcentaje', () => {
      // precio undefined → 0; 0 * (1 + 10/100) = 0 → error porque precio final es 0
      const producto = crearProducto(undefined, 25);
      expect(() => producto.aumentarPrecioPorPorcentaje(10)).toThrow(
        'El precio final debe ser mayor que 0.',
      );
    });

    it('debería lanzar error si el costo recalculado resulta <= 0 por un margen negativo extremo', () => {
      // porcentaje = -200 → divisor = 1 + (-200/100) = -1
      // nuevoPrecio = 100 + 1 = 101 (pasa la guardia de precio positivo)
      // costoRecalculado = 101 / -1 = -101 → debe lanzar el error del COSTO, no del precio
      const producto = crearProducto(100, -200);
      expect(() => producto.aumentarPrecioPorMonto(1)).toThrow(
        'El costo recalculado debe ser mayor que 0.',
      );
    });
  });
});

// =========================================================================
// Producto.crear() - cálculo de precio con VOs  (CR-001)
// =========================================================================
describe('Producto.crear()', () => {
  /**
   * Construye un producto completo vía Producto.crear() con los VOs
   * y relaciones mínimas que la firma del método exige.
   */
  function crearProductoCompleto(costo?: number, porcentaje?: number): Producto {
    return Producto.crear({
      denominacion: new Denominacion('Producto Test'),
      costo: new Costo(costo ?? 100),
      porcentaje: new Porcentaje(porcentaje ?? 25),
      alicuotaIva: AlicuotaIva.ALICUOTA_21,
      utilizaStockMinimo: false,
      linea: new Linea(),
      marca: new Marca(),
      usuarioCreated: new Usuario(),
      utilizaPack: false,
      presentacionCantidad: 5,
      presentacionUnidadMedida: UnidadMedida.UN,
    });
  }

  it('debería calcular precio = costo * (1 + porcentaje/100) con costo y porcentaje válidos', () => {
    // costo 100, porcentaje 25 → 100 * 1.25 = 125
    const producto = crearProductoCompleto(100, 25);
    expect(producto.precio).toBe(125);
    expect(producto.costo).toBe(100);
    expect(producto.porcentaje).toBe(25);
  });

  it('debería dejar precio === costo cuando el porcentaje es 0', () => {
    // costo 100, porcentaje 0 → 100 * 1 = 100
    const producto = crearProductoCompleto(100, 0);
    expect(producto.precio).toBe(100);
    expect(producto.precio).toBe(producto.costo);
  });

  it('debería aceptar costo 0 y calcular precio 0 sin lanzar error', () => {
    // costo 0, porcentaje 25 → 0 * 1.25 = 0
    const producto = crearProductoCompleto(0, 25);
    expect(producto.precio).toBe(0);
    expect(producto.costo).toBe(0);
  });
});

// =========================================================================
// Producto.actualizarDatos() - recálculo de precio  (CR-001)
// =========================================================================
describe('Producto.actualizarDatos()', () => {
  /**
   * Producto con costo 100, porcentaje 25 y precio inicial 125.
   */
  function crearProductoConPrecioInicial(): Producto {
    return Producto.crear({
      denominacion: new Denominacion('Producto Test'),
      costo: new Costo(100),
      porcentaje: new Porcentaje(25),
      alicuotaIva: AlicuotaIva.ALICUOTA_21,
      utilizaStockMinimo: false,
      linea: new Linea(),
      marca: new Marca(),
      usuarioCreated: new Usuario(),
      utilizaPack: false,
      presentacionCantidad: 5,
      presentacionUnidadMedida: UnidadMedida.UN,
    });
  }

  it('debería recalcular el precio usando el porcentaje existente si se actualiza el costo', () => {
    // costo 200, porcentaje existente 25 → 200 * 1.25 = 250
    const producto = crearProductoConPrecioInicial();
    producto.actualizarDatos({ costo: new Costo(200) });
    expect(producto.costo).toBe(200);
    expect(producto.porcentaje).toBe(25);
    expect(producto.precio).toBe(250);
  });

  it('debería recalcular el precio usando el costo existente si se actualiza el porcentaje', () => {
    // costo existente 100, porcentaje 50 → 100 * 1.50 = 150
    const producto = crearProductoConPrecioInicial();
    producto.actualizarDatos({ porcentaje: new Porcentaje(50) });
    expect(producto.costo).toBe(100);
    expect(producto.porcentaje).toBe(50);
    expect(producto.precio).toBe(150);
  });

  it('debería mantener el precio sin recalcular si no se actualiza ni costo ni porcentaje', () => {
    // solo se actualiza el stock; precio/costo/porcentaje deben quedar intactos
    const producto = crearProductoConPrecioInicial();
    producto.actualizarDatos({ stock: 10 });
    expect(producto.precio).toBe(125);
    expect(producto.costo).toBe(100);
    expect(producto.porcentaje).toBe(25);
  });
});
