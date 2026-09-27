import { BadRequestException } from '@nestjs/common';
import { Costo } from './costo.vo';

describe('Costo (Value Object)', () => {
  describe('valores inválidos', () => {
    it('debería lanzar BadRequestException si el valor es negativo', () => {
      expect(() => new Costo(-1)).toThrow(BadRequestException);
      expect(() => new Costo(-1)).toThrow('El costo no puede ser negativo.');
    });

    it('debería lanzar BadRequestException si el valor es NaN', () => {
      expect(() => new Costo(NaN)).toThrow(BadRequestException);
      expect(() => new Costo(NaN)).toThrow('El costo debe ser un número finito.');
    });

    it('debería lanzar BadRequestException si el valor es Infinity', () => {
      expect(() => new Costo(Infinity)).toThrow(BadRequestException);
      expect(() => new Costo(Infinity)).toThrow(
        'El costo debe ser un número finito.',
      );
    });

    it('debería lanzar BadRequestException si el valor es undefined', () => {
      expect(() => new Costo(undefined as any)).toThrow(BadRequestException);
      expect(() => new Costo(undefined as any)).toThrow(
        'El costo debe ser un número.',
      );
    });

    it('debería lanzar BadRequestException si el valor es null', () => {
      expect(() => new Costo(null as any)).toThrow(BadRequestException);
      expect(() => new Costo(null as any)).toThrow('El costo debe ser un número.');
    });

    it('debería lanzar BadRequestException si el valor es un string', () => {
      expect(() => new Costo('10' as any)).toThrow(BadRequestException);
      expect(() => new Costo('10' as any)).toThrow('El costo debe ser un número.');
    });
  });

  describe('valores válidos', () => {
    it('debería aceptar el valor 0 y exponerlo', () => {
      const costo = new Costo(0);
      expect(costo.valor).toBe(0);
    });

    it('debería aceptar un número positivo y exponerlo', () => {
      const costo = new Costo(150.5);
      expect(costo.valor).toBe(150.5);
    });
  });
});