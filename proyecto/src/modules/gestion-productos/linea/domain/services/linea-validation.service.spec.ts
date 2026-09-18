import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { LineaValidationService } from './linea-validation.service';
import { NotFoundException } from '@nestjs/common';

describe('LineaValidationService', () => {
  let service: LineaValidationService;

  const mockSuperLineaRepository = {
    findOne: jest.fn() as jest.Mock<any>,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LineaValidationService,
        { provide: 'ISuperLineaRepository', useValue: mockSuperLineaRepository },
      ],
    }).compile();

    service = module.get<LineaValidationService>(LineaValidationService);
    jest.clearAllMocks();
  });

  // Crear Línea con superLineaId válido
  it('debe pasar validación si superLinea existe y está activa', async () => {
    mockSuperLineaRepository.findOne.mockResolvedValue({ id: 1 });

    await expect(
      service.validateSuperLineaExists(1),
    ).resolves.toBeUndefined();

    expect(mockSuperLineaRepository.findOne).toHaveBeenCalledWith(1);
  });

  // superLineaId inexistente o eliminada
  it('debe rechazar validación si superLinea no existe (o tiene deletedAt)', async () => {
    mockSuperLineaRepository.findOne.mockResolvedValue(null);

    await expect(
      service.validateSuperLineaExists(99),
    ).rejects.toThrow(NotFoundException);
  });
});