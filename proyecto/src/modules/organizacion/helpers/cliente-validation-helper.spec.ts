import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { ClienteValidationHelper } from './cliente-validation-helper';

// ---------------------------------------------------------------------------
// Mocks de dependencias
// ---------------------------------------------------------------------------

const mockClienteRepository = {
  findByDenominacion: jest.fn(),
  findByCuit: jest.fn(),
  findByDni: jest.fn(),
  findOne: jest.fn(),
};

const mockCondicionIvaValidationHelper = {
  validateAndGetCondicionIva: jest.fn(),
  validateCondicionIvaRequirements: jest.fn(),
};

const mockUsuarioService = {
  findOne: jest.fn(),
};

const mockPersonalService = {
  findEntityById: jest.fn(),
};

// ---------------------------------------------------------------------------
// Suite principal
// ---------------------------------------------------------------------------

describe('ClienteValidationHelper', () => {
  let helper: ClienteValidationHelper;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClienteValidationHelper,
        {
          provide: 'IClienteRepository',
          useValue: mockClienteRepository,
        },
        {
          provide:
            require('src/modules/gutil/condicion-iva/helpers/condicion-iva-validation-helper')
              .CondicionIvaValidationHelper,
          useValue: mockCondicionIvaValidationHelper,
        },
        {
          provide:
            require('src/modules/gestion-usuario/usuario/application/services/usuario.service')
              .UsuarioService,
          useValue: mockUsuarioService,
        },
        {
          provide:
            require('src/modules/organizacion/personal/application/services/personal.service')
              .PersonalService,
          useValue: mockPersonalService,
        },
      ],
    }).compile();

    helper = module.get<ClienteValidationHelper>(ClienteValidationHelper);
  });

  it('debería estar definido', () => {
    expect(helper).toBeDefined();
  });

  // ===========================================================================
  // CR-001: validarFormatoCuit (método privado ejercitado vía validateCreateCliente)
  // ===========================================================================

  describe('validarFormatoCuit — ejercitado a través de validateCreateCliente', () => {
    // Prepara todos los mocks externos para que no interfieran con la validación de CUIT
    function prepararMocksExternos() {
      mockClienteRepository.findByDenominacion.mockResolvedValue(null);
      mockClienteRepository.findByCuit.mockResolvedValue(null);
      mockPersonalService.findEntityById.mockResolvedValue({ id: 1 });
      mockUsuarioService.findOne.mockResolvedValue({ id: 1 });
      mockCondicionIvaValidationHelper.validateAndGetCondicionIva.mockResolvedValue({
        id: 1,
      });
      mockCondicionIvaValidationHelper.validateCondicionIvaRequirements.mockReturnValue(
        undefined,
      );
    }

    function crearDtoConCuit(cuit: string | undefined) {
      return {
        denominacion: 'Cliente Test',
        condicionIvaId: 1,
        vendedorId: 1,
        usuarioCreatedId: 1,
        cuit,
        dni: undefined,
        domicilio: { localidadId: 1 },
      } as any;
    }

    it('debería lanzar BadRequestException cuando el CUIT tiene 10 dígitos', async () => {
      prepararMocksExternos();
      const dto = crearDtoConCuit('1234567890'); // 10 dígitos
      await expect(helper.validateCreateCliente(dto)).rejects.toThrow(
        BadRequestException,
      );
      await expect(helper.validateCreateCliente(dto)).rejects.toThrow(
        'El CUIT debe contener exactamente 11 dígitos numéricos, sin guiones ni espacios.',
      );
    });

    it('debería aceptar un CUIT con exactamente 11 dígitos', async () => {
      prepararMocksExternos();
      const dto = crearDtoConCuit('20304050607'); // 11 dígitos
      await expect(helper.validateCreateCliente(dto)).resolves.not.toThrow();
    });

    it('debería lanzar BadRequestException cuando el CUIT tiene 12 dígitos', async () => {
      prepararMocksExternos();
      const dto = crearDtoConCuit('123456789012'); // 12 dígitos
      await expect(helper.validateCreateCliente(dto)).rejects.toThrow(
        BadRequestException,
      );
      await expect(helper.validateCreateCliente(dto)).rejects.toThrow(
        'El CUIT debe contener exactamente 11 dígitos numéricos, sin guiones ni espacios.',
      );
    });

    it('debería lanzar BadRequestException cuando el CUIT contiene letras', async () => {
      prepararMocksExternos();
      const dto = crearDtoConCuit('2030405060A'); // letras
      await expect(helper.validateCreateCliente(dto)).rejects.toThrow(
        BadRequestException,
      );
      await expect(helper.validateCreateCliente(dto)).rejects.toThrow(
        'El CUIT debe contener exactamente 11 dígitos numéricos, sin guiones ni espacios.',
      );
    });

    it('debería aceptar cuando el CUIT está ausente (undefined)', async () => {
      prepararMocksExternos();
      const dto = crearDtoConCuit(undefined);
      await expect(helper.validateCreateCliente(dto)).resolves.not.toThrow();
    });
  });

  // ===========================================================================
  // CR-001: validarFormatoDni (método privado ejercitado vía validateCreateCliente)
  // ===========================================================================

  describe('validarFormatoDni — ejercitado a través de validateCreateCliente', () => {
    function prepararMocksExternos() {
      mockClienteRepository.findByDenominacion.mockResolvedValue(null);
      mockClienteRepository.findByCuit.mockResolvedValue(null);
      mockPersonalService.findEntityById.mockResolvedValue({ id: 1 });
      mockUsuarioService.findOne.mockResolvedValue({ id: 1 });
      mockCondicionIvaValidationHelper.validateAndGetCondicionIva.mockResolvedValue({
        id: 1,
      });
      mockCondicionIvaValidationHelper.validateCondicionIvaRequirements.mockReturnValue(
        undefined,
      );
    }

    function crearDtoConDni(dni: string | undefined) {
      return {
        denominacion: 'Cliente DNI Test',
        condicionIvaId: 1,
        vendedorId: 1,
        usuarioCreatedId: 1,
        cuit: undefined,
        dni,
        domicilio: { localidadId: 1 },
      } as any;
    }

    it('debería lanzar BadRequestException cuando el DNI tiene 6 dígitos', async () => {
      prepararMocksExternos();
      const dto = crearDtoConDni('123456'); // 6 dígitos
      await expect(helper.validateCreateCliente(dto)).rejects.toThrow(
        BadRequestException,
      );
      await expect(helper.validateCreateCliente(dto)).rejects.toThrow(
        'El DNI debe contener 7 u 8 dígitos numéricos.',
      );
    });

    it('debería aceptar un DNI con exactamente 7 dígitos', async () => {
      prepararMocksExternos();
      const dto = crearDtoConDni('1234567'); // 7 dígitos
      await expect(helper.validateCreateCliente(dto)).resolves.not.toThrow();
    });

    it('debería aceptar un DNI con exactamente 8 dígitos', async () => {
      prepararMocksExternos();
      const dto = crearDtoConDni('12345678'); // 8 dígitos
      await expect(helper.validateCreateCliente(dto)).resolves.not.toThrow();
    });

    it('debería lanzar BadRequestException cuando el DNI tiene 9 dígitos', async () => {
      prepararMocksExternos();
      const dto = crearDtoConDni('123456789'); // 9 dígitos
      await expect(helper.validateCreateCliente(dto)).rejects.toThrow(
        BadRequestException,
      );
      await expect(helper.validateCreateCliente(dto)).rejects.toThrow(
        'El DNI debe contener 7 u 8 dígitos numéricos.',
      );
    });

    it('debería lanzar BadRequestException cuando el DNI contiene letras', async () => {
      prepararMocksExternos();
      const dto = crearDtoConDni('1234A67'); // letras
      await expect(helper.validateCreateCliente(dto)).rejects.toThrow(
        BadRequestException,
      );
      await expect(helper.validateCreateCliente(dto)).rejects.toThrow(
        'El DNI debe contener 7 u 8 dígitos numéricos.',
      );
    });

    it('debería aceptar cuando el DNI está ausente (undefined)', async () => {
      prepararMocksExternos();
      const dto = crearDtoConDni(undefined);
      await expect(helper.validateCreateCliente(dto)).resolves.not.toThrow();
    });
  });
});
