import { BadRequestException } from '@nestjs/common';
import { Producto } from './producto.entity';

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
