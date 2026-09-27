import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { SeedFamiliaProductoService } from './seed-familia-producto.service';
import { Linea } from 'src/modules/gestion-productos/linea/domain/entities/linea.entity';
import { Marca } from 'src/modules/gestion-productos/marca/domain/entities/marca.entity';
import { SuperLinea } from 'src/modules/gestion-productos/super-linea/domain/entities/super-linea.entity';
import { Usuario } from 'src/modules/gestion-usuario/usuario/domain/entities/usuario.entity';
import { Proveedor } from 'src/modules/organizacion/proveedor/domain/entities/proveedor.entity';

describe('SeedFamiliaProductoService', () => {
  let service: SeedFamiliaProductoService;

  const mockLineaRepository = {
    findOneBy: jest.fn() as jest.Mock<any>,
    create: jest.fn() as jest.Mock<any>,
    save: jest.fn() as jest.Mock<any>,
  };

  const mockMarcaRepository = {
    findOneBy: jest.fn() as jest.Mock<any>,
    create: jest.fn() as jest.Mock<any>,
    save: jest.fn() as jest.Mock<any>,
  };

  const mockSuperLineaRepository = {
    findOneBy: jest.fn() as jest.Mock<any>,
    create: jest.fn() as jest.Mock<any>,
    save: jest.fn() as jest.Mock<any>,
  };

  const mockProveedorRepository = {};

  const mockUsuarioRepository = {
    findOneBy: jest.fn() as jest.Mock<any>,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SeedFamiliaProductoService,
        { provide: getRepositoryToken(Linea), useValue: mockLineaRepository },
        { provide: getRepositoryToken(Marca), useValue: mockMarcaRepository },
        {
          provide: getRepositoryToken(SuperLinea),
          useValue: mockSuperLineaRepository,
        },
        {
          provide: getRepositoryToken(Proveedor),
          useValue: mockProveedorRepository,
        },
        { provide: getRepositoryToken(Usuario), useValue: mockUsuarioRepository },
      ],
    }).compile();

    service = module.get<SeedFamiliaProductoService>(SeedFamiliaProductoService);
    jest.clearAllMocks();
  });

  // [CR-003] Las líneas creadas deben llevan superLineaId de "Sin clasificar"
  it('debe asignar el superLineaId de "Sin clasificar" cuando la línea no trae uno', async () => {
    jest.spyOn(console, 'log').mockImplementation(() => undefined);

    mockSuperLineaRepository.findOneBy.mockResolvedValue({
      id: 1,
      denominacion: 'Sin clasificar',
      sistema: 1,
    });
    mockLineaRepository.findOneBy.mockResolvedValue(null);
    mockUsuarioRepository.findOneBy.mockResolvedValue({ id: 1 });
    mockLineaRepository.create.mockImplementation((e) => e);

    await service.seedLineas([
      { denominacion: 'Aceites', sistema: 0, usuarioCreatedId: 1 },
    ]);

    expect(mockLineaRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ superLineaId: 1 }),
    );
    expect(mockLineaRepository.save).toHaveBeenCalled();
  });

  // [CR-003] Si no existe la SuperLínea de sistema, el seed la crea antes de las líneas
  it('debe crear la SuperLínea "Sin clasificar" si no existe', async () => {
    jest.spyOn(console, 'log').mockImplementation(() => undefined);

    mockSuperLineaRepository.findOneBy.mockResolvedValue(null);
    mockSuperLineaRepository.create.mockImplementation((e) => e);
    mockSuperLineaRepository.save.mockResolvedValue({
      id: 5,
      denominacion: 'Sin clasificar',
      sistema: 1,
    });
    mockLineaRepository.findOneBy.mockResolvedValue(null);
    mockUsuarioRepository.findOneBy.mockResolvedValue({ id: 1 });
    mockLineaRepository.create.mockImplementation((e) => e);

    await service.seedLineas([
      { denominacion: 'Azucar', sistema: 0, usuarioCreatedId: 1 },
    ]);

    expect(mockSuperLineaRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        denominacion: 'Sin clasificar',
        sistema: 1,
      }),
    );
    expect(mockLineaRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ superLineaId: 5 }),
    );
  });

  // [CR-003] No sobrescribe un superLineaId que la línea ya trae asignado
  it('debe respetar el superLineaId ya asignado en la línea', async () => {
    jest.spyOn(console, 'log').mockImplementation(() => undefined);

    mockSuperLineaRepository.findOneBy.mockResolvedValue({
      id: 1,
      denominacion: 'Sin clasificar',
      sistema: 1,
    });
    mockLineaRepository.findOneBy.mockResolvedValue(null);
    mockUsuarioRepository.findOneBy.mockResolvedValue({ id: 1 });
    mockLineaRepository.create.mockImplementation((e) => e);

    await service.seedLineas([
      { denominacion: 'Chocolates', sistema: 0, usuarioCreatedId: 1, superLineaId: 7 },
    ]);

    expect(mockLineaRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ superLineaId: 7 }),
    );
  });

  // [CR-003] No duplica líneas existentes
  it('debe saltear líneas que ya existen', async () => {
    jest.spyOn(console, 'log').mockImplementation(() => undefined);

    mockSuperLineaRepository.findOneBy.mockResolvedValue({
      id: 1,
      denominacion: 'Sin clasificar',
      sistema: 1,
    });
    mockLineaRepository.findOneBy.mockResolvedValue({ id: 99 });

    await service.seedLineas([
      { denominacion: 'Aceites', sistema: 0, usuarioCreatedId: 1 },
    ]);

    expect(mockLineaRepository.create).not.toHaveBeenCalled();
    expect(mockLineaRepository.save).not.toHaveBeenCalled();
  });
});