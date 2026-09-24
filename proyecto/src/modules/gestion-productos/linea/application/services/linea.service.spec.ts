import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { LineaService } from './linea.service';
import { Linea } from '../../domain/entities/linea.entity';
import { PoliticaEliminacionLinea } from '../../domain/services/politica-eliminacion-linea.service';
import { LineaValidationService } from '../../domain/services/linea-validation.service';
import { UsuarioService } from 'src/modules/gestion-usuario/usuario/application/services/usuario.service';

describe('LineaService', () => {
  let service: LineaService;

  const mockLineaRepository = {
    findByDenominacionFiltered: jest.fn() as jest.Mock<any>,
    findAllFor: jest.fn() as jest.Mock<any>,
    findOne: jest.fn() as jest.Mock<any>,
    findByDenominacionWith: jest.fn() as jest.Mock<any>,
    findByDenominacion: jest.fn() as jest.Mock<any>,
    create: jest.fn() as jest.Mock<any>,
    update: jest.fn() as jest.Mock<any>,
    remove: jest.fn() as jest.Mock<any>,
    findByIdConAuditoria: jest.fn() as jest.Mock<any>,
    findAllListado: jest.fn() as jest.Mock<any>,
    findAllSinSistemaFor: jest.fn() as jest.Mock<any>,
  };

  const mockPoliticaEliminacion = {
    tieneProductosActivosParaLinea: jest.fn() as jest.Mock<any>,
  };

  const mockUsuarioService = {};

  const mockLineaValidation = {
    validateSuperLineaExists: jest.fn() as jest.Mock<any>,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LineaService,
        { provide: 'ILineaRepository', useValue: mockLineaRepository },
        {
          provide: PoliticaEliminacionLinea,
          useValue: mockPoliticaEliminacion,
        },
        { provide: UsuarioService, useValue: mockUsuarioService },
        { provide: LineaValidationService, useValue: mockLineaValidation },
      ],
    }).compile();

    service = module.get<LineaService>(LineaService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // [CR-003] findByDenominacionFiltered debe poblar superLineaDenominacion
  it('debe poblar superLineaDenominacion en findByDenominacionFiltered', async () => {
    const lineaConSuperLinea = {
      id: 1,
      denominacion: 'Aceites',
      superLineaId: 1,
      superLinea: { id: 1, denominacion: 'AlmacÃ©n' },
      sistema: 0,
      deletedAt: null,
    } as unknown as Linea;

    mockLineaRepository.findByDenominacionFiltered.mockResolvedValue({
      data: [lineaConSuperLinea],
      total: 1,
    });

    const result = await service.findByDenominacionFiltered('', 0, 10, false);

    expect(result.data[0].superLineaDenominacion).toBe('AlmacÃ©n');
    expect(mockLineaRepository.findByDenominacionFiltered).toHaveBeenCalledWith(
      '',
      0,
      10,
      false,
    );
  });

  // [CR-003] findAllFor debe poblar superLineaDenominacion
  it('debe poblar superLineaDenominacion en findAllFor', async () => {
    const lineaConSuperLinea = {
      id: 2,
      denominacion: 'Chocolates',
      superLineaId: 1,
      superLinea: { id: 1, denominacion: 'AlmacÃ©n' },
      sistema: 0,
      deletedAt: null,
    } as unknown as Linea;

    mockLineaRepository.findAllFor.mockResolvedValue([lineaConSuperLinea]);

    const result = await service.findAllFor('Choc');

    expect(result.data[0].superLineaDenominacion).toBe('AlmacÃ©n');
    expect(mockLineaRepository.findAllFor).toHaveBeenCalledWith('Choc');
  });

  // [CR-003] sin superLinea cargada, superLineaDenominacion queda undefined
  it('debe dejar superLineaDenominacion undefined si la entidad no trae superLinea', async () => {
    const lineaSinSuperLinea = {
      id: 3,
      denominacion: 'Aceitunas',
      superLineaId: 1,
      sistema: 0,
      deletedAt: null,
    } as unknown as Linea;

    mockLineaRepository.findAllFor.mockResolvedValue([lineaSinSuperLinea]);

    const result = await service.findAllFor('Aceit');

    expect(result.data[0].superLineaDenominacion).toBeUndefined();
  });
});