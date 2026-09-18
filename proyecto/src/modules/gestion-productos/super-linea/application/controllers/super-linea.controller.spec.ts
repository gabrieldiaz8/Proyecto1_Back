import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { SuperLineaController } from './super-linea.controller';
import { SuperLineaService } from '../services/super-linea.service';
import { AuthGuard } from 'src/modules/gestion-usuario/auth/auth.guard'; 

describe('SuperLineaController', () => {
  let controller: SuperLineaController;

  const mockService = {
    create: jest.fn(),
    findBy: jest.fn(),
    findDtoById: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SuperLineaController],
      providers: [{ provide: SuperLineaService, useValue: mockService }],
    })
      .overrideGuard(AuthGuard) // No entiendo cómo funciona el AuthGuard este
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<SuperLineaController>(SuperLineaController);
  });

  it('debe estar definido', () => {
    expect(controller).toBeDefined();
  });

  it('debe llamar a create del service', async () => {
    const dto = { denominacion: 'test', usuarioCreatedId: 1 };
    await controller.create(dto);
    expect(mockService.create).toHaveBeenCalledWith(dto);
  });
});