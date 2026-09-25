import { BadRequestException } from '@nestjs/common';
import { Porcentaje } from './porcentaje.vo';

describe('Porcentaje (Value Object)', () => {
  describe('valores inválidos', () => {
    it('debería lanzar BadRequestException si el valor es negativo', () => {
      expect(() => new Porcentaje(-1)).toThrow(BadRequestException);
      expect(() => new Porcentaje(-1)).toThrow(
        'El porcentaje no puede ser negativo.',
      );
    });

    it('debería lanzar BadRequestException si el valor es NaN', () => {
      expect(() => new Porcentaje(NaN)).toThrow(BadRequestException);
      expect(() => new Porcentaje(NaN)).toThrow(
        'El porcentaje debe ser un número finito.',
      );
    });

    it('debería lanzar BadRequestException si el valor es Infinity', () => {
      expect(() => new Porcentaje(Infinity)).toThrow(BadRequestException);
      expect(() => new Porcentaje(Infinity)).toThrow(
        'El porcentaje debe ser un número finito.',
      );
    });

    it('debería lanzar BadRequestException si el valor es undefined', () => {
      expect(() => new Porcentaje(undefined as any)).toThrow(
        BadRequestException,
      );
      expect(() => new Porcentaje(undefined as any)).toThrow(
        'El porcentaje debe ser un número.',
      );
    });

    it('debería lanzar BadRequestException si el valor es null', () => {
      expect(() => new Porcentaje(null as any)).toThrow(BadRequestException);
      expect(() => new Porcentaje(null as any)).toThrow(
        'El porcentaje debe ser un número.',
      );
    });

    it('debería lanzar BadRequestException si el valor es un string', () => {
      expect(() => new Porcentaje('10' as any)).toThrow(BadRequestException);
      expect(() => new Porcentaje('10' as any)).toThrow(
        'El porcentaje debe ser un número.',
      );
    });
  });

  describe('valores válidos', () => {
    it('debería aceptar el valor 0 y exponerlo', () => {
      const porcentaje = new Porcentaje(0);
      expect(porcentaje.valor).toBe(0);
    });

    it('debería aceptar un número positivo y exponerlo', () => {
      const porcentaje = new Porcentaje(150.5);
      expect(porcentaje.valor).toBe(150.5);
    });
  });
});