import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { ConflictException, HttpException } from '@nestjs/common';
import { ProductoPersistenceAdapter } from './producto.persistence-adapters';
import { Producto } from '../../domain/entities/producto.entity';
import { GeneradorDenominacionService } from '../../domain/services/generador-denominacion.service';
import { DatabaseConnectionException } from 'src/modules/common/exceptions/database-connection.exception';
import { UnidadMedida } from '../../domain/enums/unidad-medida.enum';

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

// ===========================================================================
// CR-005: cascada de denominaciones al renombrar Marca / Línea
// ===========================================================================

describe('ProductoPersistenceAdapter — cascada de denominaciones (CR-005)', () => {
  let adapter: ProductoPersistenceAdapter;

  const mockCascadaQueryBuilder = {
    leftJoinAndSelect: jest.fn().mockReturnThis() as jest.Mock<any>,
    where: jest.fn().mockReturnThis() as jest.Mock<any>,
    andWhere: jest.fn().mockReturnThis() as jest.Mock<any>,
    getMany: jest.fn() as jest.Mock<any>,
  };

  const mockRepository = {
    createQueryBuilder: jest
      .fn()
      .mockReturnValue(mockCascadaQueryBuilder) as jest.Mock<any>,
    save: jest.fn() as jest.Mock<any>,
  };

  const mockGeneradorDenominacion = {
    generarDenominacion: jest.fn() as jest.Mock<any>,
  };

  let existsByDenominacionSpy: jest.SpiedFunction<
    ProductoPersistenceAdapter['existsByDenominacion']
  >;

  const crearProducto = (
    id: number,
    denominacion: string,
    relacion: { denominacion: string },
    presentacion: { cantidad: number; unidad: UnidadMedida },
  ): Producto => {
    const producto = new Producto();
    producto.id = id;
    producto.denominacion = denominacion;
    producto.denominacionManual = false;
    producto.presentacionCantidad = presentacion.cantidad;
    producto.presentacionUnidadMedida = presentacion.unidad;
    return Object.assign(producto, relacion) as Producto;
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductoPersistenceAdapter,
        { provide: getRepositoryToken(Producto), useValue: mockRepository },
        { provide: DataSource, useValue: {} },
        { provide: 'UnitOfWork', useValue: {} },
        {
          provide: GeneradorDenominacionService,
          useValue: mockGeneradorDenominacion,
        },
        { provide: 'IHistorialPrecioRepository', useValue: {} },
      ],
    }).compile();

    adapter = module.get<ProductoPersistenceAdapter>(ProductoPersistenceAdapter);
    jest.clearAllMocks();
    mockRepository.createQueryBuilder.mockReturnValue(mockCascadaQueryBuilder);
    mockGeneradorDenominacion.generarDenominacion.mockImplementation(
      (marca: string, linea: string, presentacion?: string) =>
        [marca, linea, presentacion].filter(Boolean).join(' ').toUpperCase(),
    );
    existsByDenominacionSpy = jest
      .spyOn(adapter, 'existsByDenominacion')
      .mockResolvedValue(false);
  });

  // =========================================================================
  // regresión del bug 409 -> 500
  // =========================================================================

  it('debería responder 409 y no 500 cuando la cascada por Marca colisiona dentro del mismo lote', async () => {
    const linea = { denominacion: 'Mermeladas' };
    mockCascadaQueryBuilder.getMany.mockResolvedValue([
      crearProducto(1, 'VIEJA 1', linea, {
        cantidad: 500,
        unidad: UnidadMedida.ML,
      }),
      crearProducto(2, 'VIEJA 2', linea, {
        cantidad: 500,
        unidad: UnidadMedida.ML,
      }),
    ]);
    // Ambas regeneran a la misma denominación => colisión intra-lote.
    mockGeneradorDenominacion.generarDenominacion.mockReturnValue(
      'ARCOR MERMELADAS 500 ML',
    );

    const error = await adapter
      .regenerarDenominacionesPorMarca(1, 'Arcor')
      .catch((e: unknown) => e);

    expect(error).toBeInstanceOf(ConflictException);
    expect(error).not.toBeInstanceOf(DatabaseConnectionException);
    expect((error as HttpException).getStatus()).toBe(409);
    expect(mockRepository.save).not.toHaveBeenCalled();
  });

  it('debería responder 409 y no 500 cuando la cascada por Marca colisiona contra un producto ya guardado en la BD', async () => {
    mockCascadaQueryBuilder.getMany.mockResolvedValue([
      crearProducto(1, 'VIEJA 1', { denominacion: 'Mermeladas' }, {
        cantidad: 500,
        unidad: UnidadMedida.ML,
      }),
    ]);
    existsByDenominacionSpy.mockResolvedValue(true);

    const error = await adapter
      .regenerarDenominacionesPorMarca(1, 'Arcor')
      .catch((e: unknown) => e);

    expect(error).toBeInstanceOf(ConflictException);
    expect(error).not.toBeInstanceOf(DatabaseConnectionException);
    expect((error as HttpException).getStatus()).toBe(409);
    expect(mockRepository.save).not.toHaveBeenCalled();
  });

  it('debería responder 409 y no 500 cuando la cascada por Línea colisiona dentro del mismo lote', async () => {
    const marca = { denominacion: 'Arcor' };
    mockCascadaQueryBuilder.getMany.mockResolvedValue([
      crearProducto(1, 'VIEJA 1', marca, {
        cantidad: 500,
        unidad: UnidadMedida.ML,
      }),
      crearProducto(2, 'VIEJA 2', marca, {
        cantidad: 500,
        unidad: UnidadMedida.ML,
      }),
    ]);
    mockGeneradorDenominacion.generarDenominacion.mockReturnValue(
      'ARCOR MERMELADAS 500 ML',
    );

    const error = await adapter
      .regenerarDenominacionesPorLinea(1, 'Mermeladas')
      .catch((e: unknown) => e);

    expect(error).toBeInstanceOf(ConflictException);
    expect(error).not.toBeInstanceOf(DatabaseConnectionException);
    expect((error as HttpException).getStatus()).toBe(409);
    expect(mockRepository.save).not.toHaveBeenCalled();
  });

  it('debería responder 409 y no 500 cuando la cascada por Línea colisiona contra un producto ya guardado en la BD', async () => {
    mockCascadaQueryBuilder.getMany.mockResolvedValue([
      crearProducto(1, 'VIEJA 1', { denominacion: 'Arcor' }, {
        cantidad: 500,
        unidad: UnidadMedida.ML,
      }),
    ]);
    existsByDenominacionSpy.mockResolvedValue(true);

    const error = await adapter
      .regenerarDenominacionesPorLinea(1, 'Mermeladas')
      .catch((e: unknown) => e);

    expect(error).toBeInstanceOf(ConflictException);
    expect(error).not.toBeInstanceOf(DatabaseConnectionException);
    expect((error as HttpException).getStatus()).toBe(409);
    expect(mockRepository.save).not.toHaveBeenCalled();
  });

  // =========================================================================
  // el re-throw no debe tapar errores genuinos de base de datos
  // =========================================================================

  it('debería seguir envolviendo en DatabaseConnectionException los errores que no son HttpException (cascade por Marca)', async () => {
    mockCascadaQueryBuilder.getMany.mockRejectedValue(
      new Error('ECONNREFUSED 127.0.0.1:3310'),
    );

    const error = await adapter
      .regenerarDenominacionesPorMarca(1, 'Arcor')
      .catch((e: unknown) => e);

    expect(error).toBeInstanceOf(DatabaseConnectionException);
    expect((error as HttpException).getStatus()).toBe(500);
  });

  it('debería seguir envolviendo en DatabaseConnectionException los errores que no son HttpException (cascade por Línea)', async () => {
    mockCascadaQueryBuilder.getMany.mockRejectedValue(
      new Error('ECONNREFUSED 127.0.0.1:3310'),
    );

    const error = await adapter
      .regenerarDenominacionesPorLinea(1, 'Mermeladas')
      .catch((e: unknown) => e);

    expect(error).toBeInstanceOf(DatabaseConnectionException);
    expect((error as HttpException).getStatus()).toBe(500);
  });

  // =========================================================================
  // camino feliz: la cascada no debe seguir filtrando NotFound en 500
  // =========================================================================

  it('debería regenerar y persistir todas las denominaciones cuando no hay colisión', async () => {
    mockCascadaQueryBuilder.getMany.mockResolvedValue([
      crearProducto(1, 'VIEJA 1', { denominacion: 'Mermeladas' }, {
        cantidad: 500,
        unidad: UnidadMedida.ML,
      }),
      crearProducto(2, 'VIEJA 2', { denominacion: 'Mermeladas' }, {
        cantidad: 1000,
        unidad: UnidadMedida.ML,
      }),
    ]);
    mockRepository.save.mockResolvedValue([]);

    const total = await adapter.regenerarDenominacionesPorMarca(1, 'Arcor');

    expect(total).toBe(2);
    expect(mockRepository.save).toHaveBeenCalledTimes(1);
  });

  it('debería propagar el NotFoundException (404) del generador sin convertirlo en 500', async () => {
    mockCascadaQueryBuilder.getMany.mockResolvedValue([
      crearProducto(1, 'VIEJA 1', { denominacion: 'Mermeladas' }, {
        cantidad: 500,
        unidad: UnidadMedida.ML,
      }),
    ]);
    mockGeneradorDenominacion.generarDenominacion.mockImplementation(() => {
      throw new (require('@nestjs/common').NotFoundException)('sin marca');
    });

    const error = await adapter
      .regenerarDenominacionesPorMarca(1, 'Arcor')
      .catch((e: unknown) => e);

    expect((error as HttpException).getStatus()).toBe(404);
    expect(error).not.toBeInstanceOf(DatabaseConnectionException);
  });
});
