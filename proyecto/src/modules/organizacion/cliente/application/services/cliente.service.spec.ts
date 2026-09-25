import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ClienteService } from './cliente.service';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

const mockRepository = {
  create: jest.fn(),
  update: jest.fn(),
  findOne: jest.fn(),
  findOneWithRelations: jest.fn(),
  findByDenominacion: jest.fn(),
  findByCuit: jest.fn(),
  findByDni: jest.fn(),
  findBy: jest.fn(),
  findAllByDenominacion: jest.fn(),
  findAllByDenominacionAndCodigo: jest.fn(),
  findByIdConAuditoria: jest.fn(),
  remove: jest.fn(),
};

const mockValidator = {
  validateCreateCliente: jest.fn(),
  validateUpdateCliente: jest.fn(),
};

const mockLocalidadService = {
  findEntityById: jest.fn(),
};

// Dependencias no ejercitadas en estos tests → mocks vacíos
const mockCondicionIvaService = {};
const mockProvinciaService = {};
const mockPersonalService = {};
const mockUsuarioService = {};
const mockEmpresaService = {};

// ---------------------------------------------------------------------------
// Suite principal
// ---------------------------------------------------------------------------

describe('ClienteService', () => {
  let service: ClienteService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClienteService,
        { provide: 'IClienteRepository', useValue: mockRepository },
        {
          provide:
            require('src/modules/gutil/condicion-iva/application/services/condicion-iva.service')
              .CondicionIvaService,
          useValue: mockCondicionIvaService,
        },
        {
          provide:
            require('src/modules/gutil/localidad/application/services/localidad.service')
              .LocalidadService,
          useValue: mockLocalidadService,
        },
        {
          provide:
            require('src/modules/gutil/provincia/application/services/provincia.service')
              .ProvinciaService,
          useValue: mockProvinciaService,
        },
        {
          provide:
            require('src/modules/organizacion/personal/application/services/personal.service')
              .PersonalService,
          useValue: mockPersonalService,
        },
        {
          provide:
            require('src/modules/gestion-usuario/usuario/application/services/usuario.service')
              .UsuarioService,
          useValue: mockUsuarioService,
        },
        {
          provide:
            require('src/modules/organizacion/empresa/application/services/empresa.service')
              .EmpresaService,
          useValue: mockEmpresaService,
        },
        {
          provide:
            require('src/modules/organizacion/helpers/cliente-validation-helper')
              .ClienteValidationHelper,
          useValue: mockValidator,
        },
      ],
    }).compile();

    service = module.get<ClienteService>(ClienteService);
  });

  it('debería estar definido', () => {
    expect(service).toBeDefined();
  });

  // ===========================================================================
  // CR-001: create — validación de domicilio.localidadId
  // ===========================================================================

  describe('create', () => {
    function crearDto(localidadId: number) {
      return {
        denominacion: 'Cliente Test',
        condicionIvaId: 1,
        vendedorId: 1,
        usuarioCreatedId: 1,
        cuit: undefined,
        dni: undefined,
        domicilio: { localidadId },
      } as any;
    }

    it('debería lanzar NotFoundException y no llamar a repository.create cuando localidadId no existe', async () => {
      // El helper de validación pasa sin problemas
      mockValidator.validateCreateCliente.mockResolvedValue({
        usuario: { id: 1 },
        categoriaIVA: { id: 1 },
        personal: { id: 1 },
      });

      // LocalidadService devuelve null → localidad inexistente
      mockLocalidadService.findEntityById.mockResolvedValue(null);

      const dto = crearDto(777);

      await expect(service.create(dto)).rejects.toThrow(NotFoundException);
      await expect(service.create(dto)).rejects.toThrow(
        'localidad con ID 777 no encontrada',
      );
      expect(mockRepository.create).not.toHaveBeenCalled();
    });
  });
});
