import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { LineaController } from './linea.controller';
import { LineaService } from '../services/linea.service';
import { AuthGuard } from 'src/modules/gestion-usuario/auth/auth.guard';

describe('LineaController', () => {
  let controller: LineaController;

  const mockService = {
    create: jest.fn() as jest.Mock<any>,
    findByDenominacionFiltered: jest.fn() as jest.Mock<any>,
    findDtoById: jest.fn() as jest.Mock<any>,
    findAllFor: jest.fn() as jest.Mock<any>,
    update: jest.fn() as jest.Mock<any>,
    remove: jest.fn() as jest.Mock<any>,
    findByIdConAuditoria: jest.fn() as jest.Mock<any>,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LineaController],
      providers: [{ provide: LineaService, useValue: mockService }],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<LineaController>(LineaController);
  });

  it('debe estar definido', () => {
    expect(controller).toBeDefined();
  });

  it('debe llamar a create del service', async () => {
    const dto = {
      denominacion: 'Aceites',
      superLineaId: 1,
      usuarioCreatedId: 1,
      utilizaStockMinimo: false,
      deletedAt: null,
    };
    await controller.create(dto);
    expect(mockService.create).toHaveBeenCalledWith(dto);
  });

  it('debe devolver la línea con superLineaDenominacion en findOne', async () => {
    const dtoConSuperLinea = {
      id: 1,
      denominacion: 'Aceites',
      superLineaId: 1,
      superLineaDenominacion: 'Almacén',
      utilizaStockMinimo: false,
      observacion: '',
      sistema: 0,
      deletedAt: null,
    };

    mockService.findDtoById.mockResolvedValue(dtoConSuperLinea);

    const result = await controller.findOne(1);

    expect(result.superLineaDenominacion).toBe('Almacén');
    expect(mockService.findDtoById).toHaveBeenCalledWith(1);
  });

  it('debe delegar search-by en findByDenominacionFiltered del service', async () => {
    mockService.findByDenominacionFiltered.mockResolvedValue({
      data: [],
      total: 0,
    });

    await controller.findByDenominacionFiltered({
      denominacion: 'Ace',
      skip: 0,
      take: 10,
      incluirEliminados: false,
    });

    expect(mockService.findByDenominacionFiltered).toHaveBeenCalledWith(
      'Ace',
      0,
      10,
      false,
    );
  });
});