import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { SuperLineaService } from './super-linea.service';
import { PoliticaEliminacionSuperLinea } from '../../domain/service/politica-eliminacion-super-linea.service';
import { ConflictException } from '@nestjs/common';
import { Usuario } from 'src/modules/gestion-usuario/usuario/domain/entities/usuario.entity';
import { UsuarioService } from 'src/modules/gestion-usuario/usuario/application/services/usuario.service';

describe('SuperLineaService', () => {
  let service: SuperLineaService;

  const mockSuperLineaRepository = {
    create: jest.fn() as jest.Mock<any>,
    findByDenominacionWith: jest.fn() as jest.Mock<any>,
    findOne: jest.fn() as jest.Mock<any>,
    findBy: jest.fn() as jest.Mock<any>,
    findAllFor: jest.fn() as jest.Mock<any>,
    findAllSinSistemaFor: jest.fn() as jest.Mock<any>,
    findAllSistemaFor: jest.fn() as jest.Mock<any>,
    remove: jest.fn() as jest.Mock<any>,
    update: jest.fn() as jest.Mock<any>,
  };

  const mockPoliticaEliminacion = {
    tieneLineasActivasParaSuperLinea: jest.fn() as jest.Mock<any>,
  };

  const mockUsuarioService = {
    findOne: jest.fn() as jest.Mock<any>,
  };

  const mockUsuario = { id: 1 } as Usuario;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SuperLineaService,
        { provide: 'ISuperLineaRepository', useValue: mockSuperLineaRepository },
        { provide: UsuarioService, useValue: mockUsuarioService },
        { provide: PoliticaEliminacionSuperLinea, useValue: mockPoliticaEliminacion },
      ],
    }).compile();

    service = module.get<SuperLineaService>(SuperLineaService);
    jest.clearAllMocks();
    mockUsuarioService.findOne.mockResolvedValue(mockUsuario);
  });

  // Crear SuperLínea con denominación válida
  it('debe crear una SuperLínea si la denominación no existe', async () => {
    mockSuperLineaRepository.findByDenominacionWith.mockResolvedValue(null);
    const createDto = { denominacion: 'bebidas', usuarioCreatedId: 1 };
    mockSuperLineaRepository.create.mockResolvedValue({ id: 1, ...createDto });

    const result = await service.create(createDto);
    expect(result).toBeDefined();
    expect(mockSuperLineaRepository.create).toHaveBeenCalledWith(createDto);
  });

  // Crear SuperLínea con denominación duplicada
  it('debe rechazar la creación si la denominación ya existe', async () => {
    mockSuperLineaRepository.findByDenominacionWith.mockResolvedValue({
      id: 1,
      denominacion: 'bebidas',
    });
    const createDto = { denominacion: 'Bebidas', usuarioCreatedId: 1 };

    await expect(service.create(createDto)).rejects.toThrow(ConflictException);
    expect(mockSuperLineaRepository.create).not.toHaveBeenCalled();
    expect(mockSuperLineaRepository.findByDenominacionWith).toHaveBeenCalledWith(
      createDto.denominacion,
    );
  });

  // Eliminar SuperLínea sin líneas activas
  it('debe permitir eliminar si no tiene líneas activas y no es del sistema', async () => {
    const superLinea = { id: 2, denominacion: 'test', sistema: 0 };
    mockSuperLineaRepository.findOne.mockResolvedValue(superLinea);
    mockPoliticaEliminacion.tieneLineasActivasParaSuperLinea.mockResolvedValue(false);
    mockSuperLineaRepository.remove.mockResolvedValue(superLinea);

    const result = await service.remove(2, mockUsuario.id);
    expect(result).toBeDefined();
    expect(mockSuperLineaRepository.remove).toHaveBeenCalled();
  });

  // Eliminar SuperLínea con líneas activas (error)
  it('debe rechazar eliminar si tiene líneas activas (ConflictException)', async () => {
    const superLinea = { id: 2, denominacion: 'test', sistema: 0 };
    mockSuperLineaRepository.findOne.mockResolvedValue(superLinea);
    mockPoliticaEliminacion.tieneLineasActivasParaSuperLinea.mockResolvedValue(true);

    await expect(service.remove(2, mockUsuario.id)).rejects.toThrow(ConflictException);
    expect(mockSuperLineaRepository.remove).not.toHaveBeenCalled();
  });

  // Editar o eliminar "Sin clasificar"
  it('debe rechazar eliminar si sistema = 1', async () => {
    const superLinea = { id: 1, denominacion: 'Sin clasificar', sistema: 1 };
    mockSuperLineaRepository.findOne.mockResolvedValue(superLinea);

    await expect(service.remove(1, mockUsuario.id)).rejects.toThrow();
    expect(mockSuperLineaRepository.remove).not.toHaveBeenCalled();
  });

  it('debe rechazar editar si sistema = 1', async () => {
    const superLinea = { id: 1, denominacion: 'Sin clasificar', sistema: 1 };
    mockSuperLineaRepository.findOne.mockResolvedValue(superLinea);

    await expect(service.update(1, { usuarioUpdatedId: 1 })).rejects.toThrow();
    expect(mockSuperLineaRepository.update).not.toHaveBeenCalled();
  });

  // findAllSinSistemaFor excluye sistema = 1
  it('debe devolver solo SuperLíneas sin sistema (sistema = 0)', async () => {
    const activas = [
      { id: 2, denominacion: 'Almacén', sistema: 0 },
      { id: 3, denominacion: 'Golosinas', sistema: 0 },
    ];
    mockSuperLineaRepository.findAllSinSistemaFor.mockResolvedValue(activas);

    const result = await service.findAllSinSistemaFor('');

    expect(result.data).toHaveLength(2);
    expect(result.data[0]).toMatchObject({ id: 2, denominacion: 'Almacén' });
    expect(mockSuperLineaRepository.findAllSinSistemaFor).toHaveBeenCalledWith('');
  });

  it('debe filtrar por denominacion en findAllSinSistemaFor', async () => {
    mockSuperLineaRepository.findAllSinSistemaFor.mockResolvedValue([]);

    const result = await service.findAllSinSistemaFor('Beb');

    expect(result.data).toEqual([]);
    expect(mockSuperLineaRepository.findAllSinSistemaFor).toHaveBeenCalledWith('Beb');
  });
});