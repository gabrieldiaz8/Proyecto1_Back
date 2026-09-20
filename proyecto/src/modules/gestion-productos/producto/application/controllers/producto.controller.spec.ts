import { Test, TestingModule } from '@nestjs/testing';
import { ProductoController } from './producto.controller';
import { ProductoService } from '../services/producto.service';
import { SearchProductoPaginationWithDto } from '../../dto/search-producto-pagination-with.dto';
import { AuthGuard } from 'src/modules/gestion-usuario/auth/auth.guard';

describe('ProductoController', () => {
  let controller: ProductoController;

  const mockService = {
    findBy: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductoController],
      providers: [
        { provide: ProductoService, useValue: mockService },
      ],
    })
    .overrideGuard(AuthGuard)
    .useValue({ canActivate: () => true })
    .compile();

    controller = module.get<ProductoController>(ProductoController);
  });

  it('debería estar definido', () => {
    expect(controller).toBeDefined();
  });


  // CR-004: search() — propagación de lineaDenominacion y superLineaDenominacion

  describe('search() — CR-004', () => {
    it('debería pasar lineaDenominacion al service cuando se recibe en el DTO', async () => {
      mockService.findBy.mockResolvedValue({ data: [], total: 0 });

      const dto = new SearchProductoPaginationWithDto();
      dto.skip = 0;
      dto.take = 10;
      dto.lineaDenominacion = 'ACEITES';

      await controller.search(dto);

      expect(mockService.findBy).toHaveBeenCalledWith(
        '',           // denominacion default
        undefined,    // codigoProveedor
        false,        // codProveedorExacto (default del DTO)
        undefined,    // codigoReferencia
        undefined,    // marcaId
        undefined,    // lineaId
        undefined,    // proveedorId
        undefined,    // conStock
        0,
        10,
        'ACEITES',    // lineaDenominacion ✓
        undefined,    // superLineaDenominacion
      );
    });

    it('debería pasar superLineaDenominacion al service cuando se recibe en el DTO', async () => {
      mockService.findBy.mockResolvedValue({ data: [], total: 0 });

      const dto = new SearchProductoPaginationWithDto();
      dto.skip = 0;
      dto.take = 10;
      dto.superLineaDenominacion = 'SALADOS';

      await controller.search(dto);

      expect(mockService.findBy).toHaveBeenCalledWith(
        '', undefined, false, undefined, undefined, undefined, undefined,
        undefined, 0, 10,
        undefined,      // lineaDenominacion
        'SALADOS',      // superLineaDenominacion ✓
      );
    });

    it('debería pasar undefined para lineaDenominacion y superLineaDenominacion cuando no vienen en el DTO', async () => {
      mockService.findBy.mockResolvedValue({ data: [], total: 0 });

      const dto = new SearchProductoPaginationWithDto();
      dto.skip = 0;
      dto.take = 10;

      await controller.search(dto);

      expect(mockService.findBy).toHaveBeenCalledWith(
        '', undefined, false, undefined, undefined, undefined, undefined,
        undefined, 0, 10,
        undefined,    // lineaDenominacion → undefined ✓
        undefined,    // superLineaDenominacion → undefined ✓
      );
    });

    it('debería pasar ambos params (lineaDenominacion + superLineaDenominacion) juntos en un solo search', async () => {
      mockService.findBy.mockResolvedValue({ data: [], total: 0 });

      const dto = new SearchProductoPaginationWithDto();
      dto.skip = 0;
      dto.take = 10;
      dto.lineaDenominacion = 'lacteos';
      dto.superLineaDenominacion = 'alimentos';

      await controller.search(dto);

      expect(mockService.findBy).toHaveBeenCalledWith(
        '', undefined, false, undefined, undefined, undefined, undefined,
        undefined, 0, 10,
        'lacteos',      // lineaDenominacion ✓
        'alimentos',    // superLineaDenominacion ✓
      );
    });

    it('debería pasar solo lineaId sin params de texto (retrocompatibilidad)', async () => {
      mockService.findBy.mockResolvedValue({ data: [], total: 0 });

      const dto = new SearchProductoPaginationWithDto();
      dto.skip = 0;
      dto.take = 10;
      dto.lineaId = 5;

      await controller.search(dto);

      expect(mockService.findBy).toHaveBeenCalledWith(
        '', undefined, false, undefined, undefined, 5, undefined,
        undefined, 0, 10,
        undefined,    // lineaDenominacion → undefined ✓
        undefined,    // superLineaDenominacion → undefined ✓
      );
    });
  });
});
