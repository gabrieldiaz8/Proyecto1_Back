import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { ProductoPersistenceAdapter } from './producto.persistence-adapters';
import { Producto } from '../../domain/entities/producto.entity';
import { GeneradorDenominacionService } from '../../domain/services/generador-denominacion.service.ts';

describe('ProductoPersistenceAdapter — findBy (CR-004)', () => {
  let adapter: ProductoPersistenceAdapter;

  const mockQueryBuilder = {
    leftJoinAndSelect: jest.fn().mockReturnThis() as jest.Mock<any>,
    andWhere: jest.fn().mockReturnThis() as jest.Mock<any>,
    orderBy: jest.fn().mockReturnThis() as jest.Mock<any>,
    skip: jest.fn().mockReturnThis() as jest.Mock<any>,
    take: jest.fn().mockReturnThis() as jest.Mock<any>,
    getManyAndCount: jest.fn() as jest.Mock<any>,
  };

  const mockRepository = {
    createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder) as jest.Mock<any>,
  };

  const mockHistorialRepo = {
    save: jest.fn(),
    findByProducto: jest.fn(),
  };

  const mockGeneradorDenominacion = {
    generarDenominacion: jest.fn(),
  };

  const llamadasDeAndWhere = () =>
    mockQueryBuilder.andWhere.mock.calls as any[];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductoPersistenceAdapter,
        { provide: getRepositoryToken(Producto), useValue: mockRepository },
        { provide: DataSource, useValue: {} },
        { provide: 'UnitOfWork', useValue: {} },
        { provide: GeneradorDenominacionService, useValue: mockGeneradorDenominacion },
        { provide: 'IHistorialPrecioRepository', useValue: mockHistorialRepo },
      ],
    }).compile();

    adapter = module.get<ProductoPersistenceAdapter>(ProductoPersistenceAdapter);
    jest.clearAllMocks();
    mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
  });

  // Caso: combo simultáneo — ambos andWhere aplicados en AND, sin pisarse
  it('debería aplicar lineaDenominacion y superLineaDenominacion en dos andWhere separados (AND)', async () => {
    mockQueryBuilder.getManyAndCount.mockResolvedValue([[], 0]);

    await adapter.findBy(
      '', '', false, '', 0, 0,
      false, 0, 10,
      'lacteos',
      'alimentos',
    );

    // Capturamos cada llamada a andWhere por separado
    const calls = llamadasDeAndWhere();

    expect(calls).toContainEqual([
      'UPPER(linea.denominacion) LIKE UPPER(:lineaDenominacion)',
      { lineaDenominacion: '%lacteos%' },
    ]);

    expect(calls).toContainEqual([
      'UPPER(superLinea.denominacion) LIKE UPPER(:superLineaDenominacion)',
      { superLineaDenominacion: '%alimentos%' },
    ]);

    // Ninguna llamada reemplaza a la otra: el parámetro de linea viaja en una
    // llamada con su propia key y el de superLinea en otra llamada aparte.
    const callDeLinea = calls.find((c: any) =>
      c[0].includes(':lineaDenominacion'),
    ) as any;
    const callDeSuperLinea = calls.find((c: any) =>
      c[0].includes(':superLineaDenominacion'),
    ) as any;

    expect(callDeLinea[1]).toEqual({ lineaDenominacion: '%lacteos%' });
    expect(callDeSuperLinea[1]).toEqual({
      superLineaDenominacion: '%alimentos%',
    });
    expect(callDeLinea[1]).not.toHaveProperty('superLineaDenominacion');
    expect(callDeSuperLinea[1]).not.toHaveProperty('lineaDenominacion');

    expect(mockQueryBuilder.getManyAndCount).toHaveBeenCalledTimes(1);
  });

  // Caso: caracteres especiales LIKE (% y _) — documenta el comportamiento
  // actual: viajan crudos como wildcards, sin escape (deuda técnica aparte).
  it('debería bindear caracteres especiales LIKE tal cual, sin escapar ni romper la query', async () => {
    mockQueryBuilder.getManyAndCount.mockResolvedValue([[], 0]);

    const resultado = await adapter.findBy(
      '', '', false, '', 0, 0,
      false, 0, 10,
      'a%ONDE_',
      undefined,
    );

    expect(resultado).toEqual({ data: [], total: 0 });

    const calls = llamadasDeAndWhere();
    expect(calls).toContainEqual([
      'UPPER(linea.denominacion) LIKE UPPER(:lineaDenominacion)',
      { lineaDenominacion: '%a%ONDE_%' }, // sin escape: comodines activos
    ]);
  });

  // Caso: sin resultados — devuelve data vacía y total 0, sin excepción
  it('debería devolver data vacía y total 0 cuando no hay resultados', async () => {
    mockQueryBuilder.getManyAndCount.mockResolvedValue([[], 0]);

    const resultado = await adapter.findBy(
      'inexistente', '', false, '', 0, 0,
      false, 0, 10,
      'inexistenteLínea',
      undefined,
    );

    expect(resultado).toEqual({ data: [], total: 0 });
    expect(mockQueryBuilder.getManyAndCount).toHaveBeenCalledTimes(1);
  });

  // Caso: retrocompatibilidad — solo lineaId, sin los nuevos params de texto
  it('debería filtrar solo por linea.id cuando no llegan lineaDenominacion ni superLineaDenominacion', async () => {
    mockQueryBuilder.getManyAndCount.mockResolvedValue([[], 0]);

    await adapter.findBy(
      '', '', false, '', 0, 5,
      false, 0, 10,
      undefined,
      undefined,
    );

    const calls = llamadasDeAndWhere();

    expect(calls).toContainEqual(['linea.id = :linea_id', { linea_id: 5 }]);

    // Ninguna condición de texto de CR-004 debe aplicarse
    const condicionesDeTexto = calls.filter(
      (c: any) =>
        c[0].includes('UPPER(linea.denominacion)') ||
        c[0].includes('UPPER(superLinea.denominacion)'),
    );
    expect(condicionesDeTexto).toHaveLength(0);

    // El resto del armado sigue intacto
    expect(calls).toContainEqual(['producto.deletedAt IS NULL']);
    expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith(
      'producto.denominacion',
      'ASC',
    );
    expect(mockQueryBuilder.skip).toHaveBeenCalledWith(0);
    expect(mockQueryBuilder.take).toHaveBeenCalledWith(10);
  });
});