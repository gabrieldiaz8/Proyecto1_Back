import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { PoliticaEliminacionSuperLinea } from './politica-eliminacion-super-linea.service';
import { I_LINEA_COUNT_PORT } from '../interfaces/linea-count.port';

describe('PoliticaEliminacionSuperLinea', () => {
  let service: PoliticaEliminacionSuperLinea;

  const mockLineaCountPort = {
    existenLineasActivasPara: jest.fn() as jest.Mock<any>,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PoliticaEliminacionSuperLinea,
        { provide: I_LINEA_COUNT_PORT, useValue: mockLineaCountPort },
      ],
    }).compile();

    service = module.get<PoliticaEliminacionSuperLinea>(PoliticaEliminacionSuperLinea);
    jest.clearAllMocks();
  });

  // REGLA 7 y 8 (Delegación)
  it('debe retornar true si el puerto informa líneas activas', async () => {
    mockLineaCountPort.existenLineasActivasPara.mockResolvedValue(true);
    const result = await service.tieneLineasActivasParaSuperLinea(1);
    expect(result).toBe(true);
    expect(mockLineaCountPort.existenLineasActivasPara).toHaveBeenCalledWith(1);
  });

  it('debe retornar false si el puerto informa que no hay líneas activas', async () => {
    mockLineaCountPort.existenLineasActivasPara.mockResolvedValue(false);
    const result = await service.tieneLineasActivasParaSuperLinea(2);
    expect(result).toBe(false);
    expect(mockLineaCountPort.existenLineasActivasPara).toHaveBeenCalledWith(2);
  });
});