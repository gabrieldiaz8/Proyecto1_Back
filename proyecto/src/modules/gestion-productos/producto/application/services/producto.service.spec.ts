import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ProductoService } from './producto.service';
import { Producto } from '../../domain/entities/producto.entity';
import { CreateProductoDto } from '../../dto/create-producto.dto';
import {
  AlcanceAjustePrecio,
  ModalidadAjustePrecio,
  TipoAjustePrecio,
} from '../../enums/ajuste-precio.enum';
import { ActualizarPreciosMasivoDto } from '../../dto/actualizar-precios-masivo.dto';
import { GeneradorDenominacionService } from '../../domain/services/generador-denominacion.service.ts';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function crearProductoFixture(
  id: number,
  denominacion: string,
  precio: number,
  porcentaje = 25,
): Producto {
  const p = new Producto();
  p.id = id;
  p.denominacion = denominacion;
  p.precio = precio;
  p.porcentaje = porcentaje;
  p.costo = 0;
  return p;
}

function crearDto(
  tipoAjuste: TipoAjustePrecio,
  modalidad: ModalidadAjustePrecio,
  valor: number,
  alcance: AlcanceAjustePrecio,
  lineaId?: number,
): ActualizarPreciosMasivoDto {
  const dto = new ActualizarPreciosMasivoDto();
  dto.tipoAjuste = tipoAjuste;
  dto.modalidad = modalidad;
  dto.valor = valor;
  dto.alcance = alcance;
  dto.lineaId = lineaId;
  return dto;
}

// ---------------------------------------------------------------------------
// Suite principal
// ---------------------------------------------------------------------------

describe('ProductoService', () => {
  let service: ProductoService;

  // Mock del repositorio — sólo los métodos que necesitamos en estos tests
  const mockRepository = {
    findActivos: jest.fn(),
    findActivosByLinea: jest.fn(),
    saveMany: jest.fn(),
    // Stubs para los demás métodos que NestJS podría requerir al resolver el provider
    findOne: jest.fn(),
    findByIdConAuditoria: jest.fn(),
    findByDenominacion: jest.fn(),
    findBy: jest.fn(),
    findByRapido: jest.fn(),
    findByIdWithoutRelations: jest.fn(),
    save: jest.fn(),
    updateEntity: jest.fn(),
    actualizarPrecio: jest.fn(),
    remove: jest.fn(),
    isCodigoProveedorDuplicado: jest.fn(),
    findByDenominacionCodigoProveedorFiltered: jest.fn(),
    existsByDenominacion: jest.fn(),
    existsByCodigoProveedor: jest.fn(),
    existsProductosActivosByMarca: jest.fn(),
    existsProductosActivosByLinea: jest.fn(),
    findByIds: jest.fn(),
  };

  // Mocks vacíos para todos los demás providers inyectados
  const mockLineaService: Record<string, jest.Mock> = {};
  const mockMarcaService: Record<string, jest.Mock> = {};
  const mockProveedorService: Record<string, jest.Mock> = {};
  const mockUsuarioService: Record<string, jest.Mock> = {};
  const mockIntrinsicValidationService: Record<string, jest.Mock> = {};
  const mockValidationService: Record<string, jest.Mock> = {};
  const mockRelatedEntitiesValidator: Record<string, jest.Mock> = {};
  const mockUniquenessValidator: Record<string, jest.Mock> = {};
  const mockUsuarioValidator: Record<string, jest.Mock> = {};
  const mockProductoDeletePolicy: Record<string, jest.Mock> = {};
  const mockGeneradorDenominacionService = {
    generarDenominacion: jest.fn().mockReturnValue('denominacion generada'),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductoService,
        { provide: 'IProductoRepository', useValue: mockRepository },
        { provide: 'LineaService', useValue: mockLineaService },
        { provide: 'MarcaService', useValue: mockMarcaService },
        {
          provide: require('src/modules/gestion-productos/linea/application/services/linea.service').LineaService,
          useValue: mockLineaService,
        },
        {
          provide: require('src/modules/gestion-productos/marca/application/services/marca.service').MarcaService,
          useValue: mockMarcaService,
        },
        {
          provide: require('src/modules/organizacion/proveedor/application/services/proveedor.service').ProveedorService,
          useValue: mockProveedorService,
        },
        {
          provide: require('src/modules/gestion-usuario/usuario/application/services/usuario.service').UsuarioService,
          useValue: mockUsuarioService,
        },
        {
          provide: require('../../domain/services/producto-intrinsic-validation.service.ts').ProductoIntrinsicValidationService,
          useValue: mockIntrinsicValidationService,
        },
        {
          provide: require('../../domain/services/producto-validation.service.ts').ProductoValidationService,
          useValue: mockValidationService,
        },
        {
          provide: require('../../infraestructure/validators/producto-related-entities.validator.ts').ProductoRelatedEntitiesValidator,
          useValue: mockRelatedEntitiesValidator,
        },
        {
          provide: require('../../infraestructure/validators/producto-uniqueness.validator.ts').ProductoUniquenessValidator,
          useValue: mockUniquenessValidator,
        },
        {
          provide: require('src/modules/common/utils/validation/usuario-validator').UsuarioValidator,
          useValue: mockUsuarioValidator,
        },
        {
          provide: require('../policies/producto-delete.policy').ProductoDeletePolicy,
          useValue: mockProductoDeletePolicy,
        },
        {
          provide: require('../../domain/services/generador-denominacion.service.ts').GeneradorDenominacionService,
          useValue: mockGeneradorDenominacionService,
        },
      ],
    }).compile();

    service = module.get<ProductoService>(ProductoService);
  });

  it('debería estar definido', () => {
    expect(service).toBeDefined();
  });

  // ===========================================================================
  // CR-001: create
  // ===========================================================================

  describe('create', () => {
    function crearCreateDto(overrides: Partial<CreateProductoDto> = {}): CreateProductoDto {
      const dto = new CreateProductoDto();
      dto.denominacion = 'producto test';
      dto.lineaId = 1;
      dto.marcaId = 1;
      dto.alicuotaIva = require('src/modules/organizacion/enums/alicuota-iva.enum').AlicuotaIva.ALICUOTA_21;
      dto.usuarioCreatedId = 1;
      dto.utilizaStockMinimo = false;
      dto.utilizaPack = false;
      dto.costo = 100;
      dto.porcentaje = 25;
      dto.precio = 125;
      return Object.assign(dto, overrides);
    }

    it('debería lanzar NotFoundException cuando lineaId no existe y no llamar a save', async () => {
      const dto = crearCreateDto({ lineaId: 999 });

      // intrinsicValidation no lanza
      mockIntrinsicValidationService.validarDatosBasicos = jest.fn();
      // uniqueness no lanza
      mockUniquenessValidator.validarDenominacionUnica = jest.fn().mockResolvedValue(undefined);
      // relatedEntities lanza NotFoundException (línea no existe)
      mockRelatedEntitiesValidator.validarYObtenerEntidadesRelacionadas = jest
        .fn()
        .mockRejectedValue(
          new (require('@nestjs/common').NotFoundException)('Línea con ID 999 no encontrada'),
        );

      await expect(service.create(dto)).rejects.toThrow(
        require('@nestjs/common').NotFoundException,
      );
      await expect(service.create(dto)).rejects.toThrow('Línea con ID 999 no encontrada');
      expect(mockRepository.save).not.toHaveBeenCalled();
    });

    it('debería lanzar NotFoundException cuando marcaId no existe y no llamar a save', async () => {
      const dto = crearCreateDto({ marcaId: 888 });

      mockIntrinsicValidationService.validarDatosBasicos = jest.fn();
      mockUniquenessValidator.validarDenominacionUnica = jest.fn().mockResolvedValue(undefined);
      // relatedEntities lanza NotFoundException (marca no existe)
      mockRelatedEntitiesValidator.validarYObtenerEntidadesRelacionadas = jest
        .fn()
        .mockRejectedValue(
          new (require('@nestjs/common').NotFoundException)('Marca con ID 888 no encontrada'),
        );

      await expect(service.create(dto)).rejects.toThrow(
        require('@nestjs/common').NotFoundException,
      );
      await expect(service.create(dto)).rejects.toThrow('Marca con ID 888 no encontrada');
      expect(mockRepository.save).not.toHaveBeenCalled();
    });

    it('debería llamar a repository.save cuando los datos son válidos', async () => {
      const dto = crearCreateDto();

      const mockLinea = { id: 1, denominacion: 'Línea A' };
      const mockMarca = { id: 1, denominacion: 'Marca A' };
      const mockUsuario = { id: 1, nombre: 'admin' };

      mockIntrinsicValidationService.validarDatosBasicos = jest.fn();
      mockUniquenessValidator.validarDenominacionUnica = jest.fn().mockResolvedValue(undefined);
      mockRelatedEntitiesValidator.validarYObtenerEntidadesRelacionadas = jest
        .fn()
        .mockResolvedValue({ marca: mockMarca, linea: mockLinea });
      mockValidationService.validarEntidadesRelacionadas = jest.fn();
      mockUsuarioValidator.validarUsuarioExiste = jest.fn().mockResolvedValue(mockUsuario);

      const entityGuardada = new (require('../../domain/entities/producto.entity').Producto)();
      entityGuardada.denominacion = dto.denominacion;
      mockRepository.save.mockResolvedValue(entityGuardada);

      await service.create(dto);

      expect(mockRepository.save).toHaveBeenCalledTimes(1);
    });
  });

  // ===========================================================================
  // CR-001: update
  // ===========================================================================

  describe('update', () => {
    it('debería lanzar NotFoundException cuando el producto a actualizar no existe', async () => {
      // findOne retorna null → producto no existe
      mockRepository.findOne.mockResolvedValue(null);

      const { UpdateProductoDto } = require('../../dto/update-producto.dto');
      const dto = new UpdateProductoDto();
      dto.usuarioUpdatedId = 1;

      await expect(service.update(999, dto)).rejects.toThrow(
        require('@nestjs/common').NotFoundException,
      );
      await expect(service.update(999, dto)).rejects.toThrow(
        'Producto con ID 999 no encontrado.',
      );
    });
  });

  // ===========================================================================
  // CR-006: actualizarPreciosMasivo
  // ===========================================================================

  describe('actualizarPreciosMasivo', () => {
    // -------------------------------------------------------------------------
    // Caso 1: Feliz — alcance GLOBAL, 2 productos válidos
    // -------------------------------------------------------------------------
    it('debería actualizar exitosamente 2 productos en alcance global y llamar a saveMany con ambos', async () => {
      const producto1 = crearProductoFixture(1, 'Producto A', 1000, 25);
      const producto2 = crearProductoFixture(2, 'Producto B', 500, 0);
      mockRepository.findActivos.mockResolvedValue([producto1, producto2]);
      mockRepository.saveMany.mockResolvedValue([producto1, producto2]);

      const dto = crearDto(
        TipoAjustePrecio.AUMENTO,
        ModalidadAjustePrecio.MONTO,
        100,
        AlcanceAjustePrecio.GLOBAL,
      );

      const resultado = await service.actualizarPreciosMasivo(dto);

      expect(resultado.totalProcesados).toBe(2);
      expect(resultado.actualizadosExitosamente).toBe(2);
      expect(resultado.excluidos).toEqual([]);
      expect(mockRepository.saveMany).toHaveBeenCalledTimes(1);
      expect(mockRepository.saveMany).toHaveBeenCalledWith([producto1, producto2]);
      expect(mockRepository.findActivos).toHaveBeenCalledTimes(1);
      expect(mockRepository.findActivosByLinea).not.toHaveBeenCalled();
    });

    // -------------------------------------------------------------------------
    // Caso 2: Tolerancia a fallos — 1 producto válido, 1 excluido por precio final <= 0
    // -------------------------------------------------------------------------
    it('debería excluir el producto que rompe la regla de dominio y persistir sólo el válido', async () => {
      const productoValido = crearProductoFixture(1, 'Producto Caro', 1000, 25);
      const productoInvalido = crearProductoFixture(2, 'Producto Barato', 10, 25);
      mockRepository.findActivos.mockResolvedValue([productoValido, productoInvalido]);
      mockRepository.saveMany.mockResolvedValue([productoValido]);

      // Disminuir $20: productoValido (1000-20=980 ✓), productoInvalido (10-20=-10 ✗)
      const dto = crearDto(
        TipoAjustePrecio.DISMINUCION,
        ModalidadAjustePrecio.MONTO,
        20,
        AlcanceAjustePrecio.GLOBAL,
      );

      const resultado = await service.actualizarPreciosMasivo(dto);

      expect(resultado.totalProcesados).toBe(2);
      expect(resultado.actualizadosExitosamente).toBe(1);
      expect(resultado.excluidos).toHaveLength(1);
      expect(resultado.excluidos[0].id).toBe(2);
      expect(resultado.excluidos[0].denominacion).toBe('Producto Barato');
      expect(resultado.excluidos[0].motivo).toBe('El precio final debe ser mayor que 0.');
      // saveMany sólo recibe el producto válido
      expect(mockRepository.saveMany).toHaveBeenCalledWith([productoValido]);
    });

    // -------------------------------------------------------------------------
    // Caso 3: Lote vacío — debe lanzar NotFoundException y NO llamar a saveMany
    // -------------------------------------------------------------------------
    it('debería lanzar NotFoundException si no hay productos para el alcance de línea y no persistir nada', async () => {
      mockRepository.findActivosByLinea.mockResolvedValue([]);

      const dto = crearDto(
        TipoAjustePrecio.AUMENTO,
        ModalidadAjustePrecio.PORCENTAJE,
        10,
        AlcanceAjustePrecio.LINEA,
        99,
      );

      await expect(service.actualizarPreciosMasivo(dto)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.actualizarPreciosMasivo(dto)).rejects.toThrow(
        'No se encontraron productos para el alcance seleccionado.',
      );
      expect(mockRepository.saveMany).not.toHaveBeenCalled();
    });

    // -------------------------------------------------------------------------
    // Caso 4: Ruteo por línea — findActivosByLinea(5) llamado, findActivos NO
    // -------------------------------------------------------------------------
    it('debería llamar a findActivosByLinea con el lineaId correcto y no llamar a findActivos global', async () => {
      const producto = crearProductoFixture(10, 'Producto Línea', 500, 20);
      mockRepository.findActivosByLinea.mockResolvedValue([producto]);
      mockRepository.saveMany.mockResolvedValue([producto]);

      const dto = crearDto(
        TipoAjustePrecio.AUMENTO,
        ModalidadAjustePrecio.PORCENTAJE,
        5,
        AlcanceAjustePrecio.LINEA,
        5,
      );

      await service.actualizarPreciosMasivo(dto);

      expect(mockRepository.findActivosByLinea).toHaveBeenCalledWith(5);
      expect(mockRepository.findActivos).not.toHaveBeenCalled();
    });
  });

  // CR-004: findBy con lineaDenominacion y superLineaDenominacion

  describe('findBy — CR-004', () => {
    const mockProducto = (() => {
      const p = new Producto();
      p.id = 1;
      p.denominacion = 'Leche Entera';
      p.precio = 500;
      p.porcentaje = 20;
      p.costo = 400;
      return p;
    })();

    beforeEach(() => {
      jest.clearAllMocks();
    });


    // Caso 1: solo lineaDenominacion
    it('debería llamar a repository.findBy con lineaDenominacion y sin superLineaDenominacion', async () => {
      mockRepository.findBy.mockResolvedValue({ data: [mockProducto], total: 1 });

      await service.findBy(
        '',           // denominacion
        '',           // codigoProveedor
        false,        // codProveedorExacto
        '',           // codigoReferencia
        0,            // marca_id
        0,            // linea_id
        false,        // conStock
        0,            // skip
        10,           // take
        'lacteos',    // lineaDenominacion
        undefined,    // superLineaDenominacion
      );

      expect(mockRepository.findBy).toHaveBeenCalledWith(
        '', '', false, '', 0, 0,
        false, 0, 10,
        'lacteos',
        undefined,
      );
    });


    // Caso 2: solo superLineaDenominacion
    it('debería llamar a repository.findBy con superLineaDenominacion y sin lineaDenominacion', async () => {
      mockRepository.findBy.mockResolvedValue({ data: [mockProducto], total: 1 });

      await service.findBy(
        '', '', false, '', 0, 0,
        false, 0, 10,
        undefined,      // lineaDenominacion
        'alimentos',    // superLineaDenominacion
      );

      expect(mockRepository.findBy).toHaveBeenCalledWith(
        '', '', false, '', 0, 0,
        false, 0, 10,
        undefined,
        'alimentos',
      );
    });


    // Caso 3: ambos combinados (AND)
    it('debería llamar a repository.findBy con lineaDenominacion y superLineaDenominacion', async () => {
      mockRepository.findBy.mockResolvedValue({ data: [mockProducto], total: 1 });

      await service.findBy(
        '', '', false, '', 0, 0,
        false, 0, 10,
        'lacteos',
        'alimentos',
      );

      expect(mockRepository.findBy).toHaveBeenCalledWith(
        '', '', false, '', 0, 0,
        false, 0, 10,
        'lacteos',
        'alimentos',
      );
    });


    // Caso 4: lineaDenominacion + denominacion existente (combinación con filtros anteriores)
    it('debería combinar denominacion y lineaDenominacion sin romper el filtro existente', async () => {
      mockRepository.findBy.mockResolvedValue({ data: [mockProducto], total: 1 });

      await service.findBy(
        'leche',
        '', false, '', 0, 0,
        false, 0, 10,
        'lacteos',
        undefined,
      );

      expect(mockRepository.findBy).toHaveBeenCalledWith(
        'leche',
        '', false, '', 0, 0,
        false, 0, 10,
        'lacteos',
        undefined,
      );
    });


    // Caso 5: sin resultados — debe devolver lista vacía, sin lanzar excepción
    it('debería devolver data vacía y total 0 cuando el repositorio no encuentra resultados', async () => {
      mockRepository.findBy.mockResolvedValue({ data: [], total: 0 });

      const resultado = await service.findBy(
        '', '', false, '', 0, 0,
        false, 0, 10,
        'inexistente',
        undefined,
      );

      expect(resultado.data).toEqual([]);
      expect(resultado.total).toBe(0);
      expect(mockRepository.findBy).toHaveBeenCalledTimes(1);
    });

    // Caso 6: retrocompatibilidad — solo lineaId, sin los nuevos params de texto
    it('debería pasar lineaId sin params de texto de CR-004 (retrocompatibilidad)', async () => {
      mockRepository.findBy.mockResolvedValue({ data: [mockProducto], total: 1 });

      await service.findBy(
        '', '', false, '', 0, 5,
        false, 0, 10,
        undefined,      // lineaDenominacion
        undefined,      // superLineaDenominacion
      );

      expect(mockRepository.findBy).toHaveBeenCalledWith(
        '', '', false, '', 0, 5,
        false, 0, 10,
        undefined,
        undefined,
      );
    });
  });

});

