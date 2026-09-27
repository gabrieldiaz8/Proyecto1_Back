import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { LineaCountAdapter } from './linea-count.adapter';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Linea } from '../../domain/entities/linea.entity';
import { IsNull } from 'typeorm';

describe('LineaCountAdapter (Integration/Unit)', () => {
  let adapter: LineaCountAdapter;

  const mockRepository = {
    count: jest.fn() as jest.Mock<any>,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LineaCountAdapter,
        { provide: getRepositoryToken(Linea), useValue: mockRepository },
      ],
    }).compile();

    adapter = module.get<LineaCountAdapter>(LineaCountAdapter);
    jest.clearAllMocks();
  });

  // Verifica que la query se arma bien aislando las soft-deleted
  it('debe retornar true y filtrar por superLineaId y deletedAt IsNull si hay líneas activas', async () => {
    mockRepository.count.mockResolvedValue(1);

    const result = await adapter.existenLineasActivasPara(1);

    expect(result).toBe(true);
    expect(mockRepository.count).toHaveBeenCalledWith({
      where: { superLineaId: 1, deletedAt: IsNull() },
    });
  });

  // Caso complementario: sin líneas activas
  it('debe retornar false si el count es 0', async () => {
    mockRepository.count.mockResolvedValue(0);

    const result = await adapter.existenLineasActivasPara(2);

    expect(result).toBe(false);
    expect(mockRepository.count).toHaveBeenCalledWith({
      where: { superLineaId: 2, deletedAt: IsNull() },
    });
  });
});