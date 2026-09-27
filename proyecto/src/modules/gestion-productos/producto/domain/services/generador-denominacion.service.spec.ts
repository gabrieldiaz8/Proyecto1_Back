import { GeneradorDenominacionService } from './generador-denominacion.service';

describe('GeneradorDenominacionService', () => {
  const service = new GeneradorDenominacionService();

  // ===========================================================================
  // CR-005 B-01: generación de la denominación automática
  // ===========================================================================

  describe('generarDenominacion', () => {
    it('debería concatenar Marca + Línea + Presentación en mayúsculas', () => {
      const resultado = service.generarDenominacion('Arcor', 'Mermeladas', '400 G');

      expect(resultado).toBe('ARCOR MERMELADAS 400 G');
    });

    it('debería normalizar espacios y mayúsculas de cada parte', () => {
      const resultado = service.generarDenominacion(
        '  arcor  ',
        ' mermeladas ',
        '  500 G  ',
      );

      expect(resultado).toBe('ARCOR MERMELADAS 500 G');
    });

    it('debería generar marca + línea cuando no hay presentación', () => {
      const resultado = service.generarDenominacion('Arcor', 'Mermeladas');

      expect(resultado).toBe('ARCOR MERMELADAS');
    });

    it('debería omitir la presentación si llega undefined o vacía', () => {
      expect(service.generarDenominacion('Arcor', 'Mermeladas', undefined)).toBe(
        'ARCOR MERMELADAS',
      );
      expect(service.generarDenominacion('Arcor', 'Mermeladas', '   ')).toBe(
        'ARCOR MERMELADAS',
      );
    });

    it('debería devolver vacío cuando todas las partes están vacías', () => {
      expect(service.generarDenominacion('', '', undefined)).toBe('');
      expect(service.generarDenominacion('   ', '', '  ')).toBe('');
    });

    it('debería mantener los valores ya normalizados en mayúsculas', () => {
      const resultado = service.generarDenominacion(
        'ARCOR',
        'MERMELADAS',
        '400 G',
      );

      expect(resultado).toBe('ARCOR MERMELADAS 400 G');
    });
  });
});