import { BadRequestException } from '@nestjs/common';
import { Precio } from './precio.vo';
import { Costo } from './costo.vo';
import { Porcentaje } from './porcentaje.vo';

describe('Precio (Value Object)', () => {
  describe('calcular', () => {
    it('debería calcular costo * (1 + porcentaje/100)', () => {
      const precio = Precio.calcular(new Costo(100), new Porcentaje(25));
      expect(precio.valor).toBe(125);
    });

    it('debería devolver el costo cuando el porcentaje es 0', () => {
      const precio = Precio.calcular(new Costo(150.5), new Porcentaje(0));
      expect(precio.valor).toBe(150.5);
    });

    it('debería redondear el resultado a 5 decimales', () => {
      const precio = Precio.calcular(new Costo(1), new Porcentaje(33.333333));
      expect(precio.valor).toBe(1.33333);
    });

    it('debería devolver 0 cuando costo y porcentaje son 0', () => {
      const precio = Precio.calcular(new Costo(0), new Porcentaje(0));
      expect(precio.valor).toBe(0);
    });
  });

  describe('desbordamiento', () => {
    it('debería lanzar BadRequestException si el cálculo desborda a Infinity por costo enorme', () => {
      expect(() =>
        Precio.calcular(new Costo(Number.MAX_VALUE), new Porcentaje(100)),
      ).toThrow(BadRequestException);
      expect(() =>
        Precio.calcular(new Costo(Number.MAX_VALUE), new Porcentaje(100)),
      ).toThrow('El precio calculado debe ser un número finito.');
    });

    it('debería lanzar BadRequestException si el cálculo desborda a Infinity por porcentaje descomunal', () => {
      expect(() =>
        Precio.calcular(new Costo(Number.MAX_VALUE), new Porcentaje(Number.MAX_VALUE)),
      ).toThrow(BadRequestException);
    });
  });
});