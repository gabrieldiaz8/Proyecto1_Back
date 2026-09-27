import { BadRequestException } from '@nestjs/common';
import { Presentacion } from './presentacion.vo';
import { UnidadMedida } from '../enums/unidad-medida.enum';

describe('Presentacion (Value Object) — CR-002', () => {
  describe('CP-CR002-B-01: par incompleto', () => {
    it('debería lanzar BadRequestException si falta alguno de los 2 campos (cantidad sin unidad)', () => {
      expect(() => new Presentacion(500, undefined as any)).toThrow(
        BadRequestException,
      );
    });

    it('debería lanzar BadRequestException si falta alguno de los 2 campos (unidad sin cantidad)', () => {
      expect(() => new Presentacion(undefined as any, UnidadMedida.L)).toThrow(
        BadRequestException,
      );
    });
  });

  describe('CP-CR002-B-02: cantidad inválida', () => {
    it('debería lanzar BadRequestException si presentacionCantidad es 0', () => {
      expect(() => new Presentacion(0, UnidadMedida.L)).toThrow(
        BadRequestException,
      );
    });

    it('debería lanzar BadRequestException si presentacionCantidad es negativa', () => {
      expect(() => new Presentacion(-500, UnidadMedida.L)).toThrow(
        BadRequestException,
      );
    });

    it('debería lanzar BadRequestException si presentacionCantidad es NaN', () => {
      expect(() => new Presentacion(NaN, UnidadMedida.L)).toThrow(
        BadRequestException,
      );
    });

    it('debería lanzar BadRequestException si presentacionCantidad no es numérica', () => {
      expect(() => new Presentacion('500' as any, UnidadMedida.L)).toThrow(
        BadRequestException,
      );
    });

    it('debería lanzar BadRequestException si presentacionCantidad es Infinity', () => {
      expect(() => new Presentacion(Infinity, UnidadMedida.L)).toThrow(
        BadRequestException,
      );
    });

    it('debería lanzar BadRequestException si presentacionCantidad es -Infinity', () => {
      expect(() => new Presentacion(-Infinity, UnidadMedida.L)).toThrow(
        BadRequestException,
      );
    });
  });

  describe('CP-CR002-B-03: unidad de medida vacía', () => {
    it('debería lanzar BadRequestException si la unidad de medida es una cadena vacía', () => {
      expect(() => new Presentacion(500, '' as any)).toThrow(
        BadRequestException,
      );
    });

    it('debería lanzar BadRequestException si la unidad de medida son solo espacios', () => {
      expect(() => new Presentacion(500, '   ' as any)).toThrow(
        BadRequestException,
      );
    });
  });

  describe('caso feliz', () => {
    it('debería crear el VO exitosamente cuando cantidad > 0 y unidad es válida', () => {
      const presentacion = new Presentacion(500, UnidadMedida.L);
      expect(presentacion.cantidad).toBe(500);
      expect(presentacion.unidadMedida).toBe(UnidadMedida.L);
    });

    it('debería exponer la descripción formateada "cantidad unidad"', () => {
      const presentacion = new Presentacion(1.5, UnidadMedida.L);
      expect(presentacion.getDescripcionFormateada()).toBe('1.5 L');
      expect(presentacion.toString()).toBe('1.5 L');
    });
  });
});