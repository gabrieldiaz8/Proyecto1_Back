import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { AuthGuard } from 'src/modules/gestion-usuario/auth/auth.guard';
import { ProductoController } from './producto.controller';
import { ProductoService } from '../services/producto.service';
import { HistorialPrecioService } from 'src/modules/gestion-productos/historial-precio/application/services/historial-precio.service';
import { SearchProductoPaginationWithDto } from '../../dto/search-producto-pagination-with.dto';
import { AuthGuard } from 'src/modules/gestion-usuario/auth/auth.guard';

describe('ProductoController', () => {
  let controller: ProductoController;
  let productoService: jest.Mocked<Partial<ProductoService>>;
  let historialPrecioService: jest.Mocked<Partial<HistorialPrecioService>>;

  const mockService = {
    findBy: jest.fn(),
  };

  beforeEach(async () => {
    productoService = {
      actualizarPrecio: jest.fn(),
    };

    historialPrecioService = {
      findByProducto: jest.fn(),
    };
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductoController],
      providers: [
        { provide: ProductoService, useValue: productoService },
        { provide: HistorialPrecioService, useValue: historialPrecioService },
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

  describe('PUT /producto/:id/precio', () => {
    it('llama a service.actualizarPrecio y devuelve la respuesta', async () => {
      const dto = {
        costo: 50, costoDolar: 0, cotizacionDolar: 0,
        porcentaje: 20, usuarioId: 1, motivo: 'Ajuste', precio: 150,
      };
      const respuestaEsperada = { message: 'Precio actualizado' };
      (productoService.actualizarPrecio as jest.Mock).mockResolvedValue(respuestaEsperada);

      const resultado = await controller.actualizarPrecio(1, dto as any);

      expect(productoService.actualizarPrecio).toHaveBeenCalledWith(1, dto);
      expect(resultado).toBe(respuestaEsperada);
    });

    it('propaga BadRequestException cuando el service la lanza', async () => {
      const dto = {
        costo: 50, costoDolar: 0, cotizacionDolar: 0,
        porcentaje: 20, usuarioId: 1, motivo: 'Ajuste', precio: 0,
      };
      (productoService.actualizarPrecio as jest.Mock).mockRejectedValue(
        new BadRequestException('El precio resultante debe ser mayor a 0.'),
      );

      await expect(controller.actualizarPrecio(1, dto as any))
        .rejects.toThrow(BadRequestException);
    });
  });

  describe('GET /producto/:id/historial-precios', () => {
    it('llama a historialPrecioService.findByProducto con los parámetros correctos y devuelve el resultado', async () => {
      const respuestaEsperada = {
        data: [{ id: 1, precioAnterior: 100, precioNuevo: 150, motivo: 'Ajuste', fechaCambio: new Date(), productoId: 1 }],
        total: 1,
      };
      (historialPrecioService.findByProducto as jest.Mock).mockResolvedValue(respuestaEsperada);

      const resultado = await controller.findHistorialPrecios(1, { productoId: 1, skip: 0, take: 10 } as any);

      expect(historialPrecioService.findByProducto).toHaveBeenCalledWith(1, 0, 10);
      expect(resultado).toBe(respuestaEsperada);

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
