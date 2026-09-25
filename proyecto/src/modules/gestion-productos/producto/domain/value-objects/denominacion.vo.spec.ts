import { BadRequestException } from '@nestjs/common';
import { Denominacion } from './denominacion.vo';

describe('Denominacion (Value Object)', () => {
  describe('valores no-string', () => {
    it('debería lanzar BadRequestException si el valor es null', () => {
      expect(() => new Denominacion(null as any)).toThrow(BadRequestException);
      expect(() => new Denominacion(null as any)).toThrow(
        'La denominación debe ser una cadena de texto.',
      );
    });

    it('debería lanzar BadRequestException si el valor es undefined', () => {
      expect(() => new Denominacion(undefined as any)).toThrow(
        BadRequestException,
      );
      expect(() => new Denominacion(undefined as any)).toThrow(
        'La denominación debe ser una cadena de texto.',
      );
    });

    it('debería lanzar BadRequestException si el valor es un número', () => {
      expect(() => new Denominacion(123 as any)).toThrow(BadRequestException);
      expect(() => new Denominacion(123 as any)).toThrow(
        'La denominación debe ser una cadena de texto.',
      );
    });
  });

  describe('valor vacío o solo espacios', () => {
    it('debería lanzar BadRequestException si el valor es una cadena vacía', () => {
      expect(() => new Denominacion('')).toThrow(BadRequestException);
      expect(() => new Denominacion('')).toThrow(
        'La denominación no puede estar vacía.',
      );
    });

    it('debería lanzar BadRequestException si el valor contiene solo espacios', () => {
      expect(() => new Denominacion('   ')).toThrow(BadRequestException);
      expect(() => new Denominacion('   ')).toThrow(
        'La denominación no puede estar vacía.',
      );
    });
  });

  describe('caracteres no permitidos', () => {
    it('debería lanzar BadRequestException si el valor contiene caracteres inválidos', () => {
      const inválidas = ['Cafe@', 'Cafe#1', 'Cafe,rojo', 'Cafe:latte'];
      for (const inválida of inválidas) {
        expect(() => new Denominacion(inválida)).toThrow(BadRequestException);
      }
      expect(() => new Denominacion('Cafe@')).toThrow(
        'La denominación contiene caracteres no permitidos. Solo se aceptan letras, números, espacios y los símbolos: . - / %',
      );
    });
  });

  describe('valores válidos', () => {
    it('debería aceptar una cadena válida y exponer el valor recortado', () => {
      const denominacion = new Denominacion('  Cafe 123 %-./  ');
      expect(denominacion.valor).toBe('Cafe 123 %-./');
    });

    it('debería aceptar una cadena válida con acentos y exponerla', () => {
      const denominacion = new Denominacion('Café Águila');
      expect(denominacion.valor).toBe('Café Águila');
    });

    it('debería aceptar una cadena válida sin recorte necesario', () => {
      const denominacion = new Denominacion('Azúcar');
      expect(denominacion.valor).toBe('Azúcar');
    });
  });
});