import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { AuthGuard } from 'src/modules/gestion-usuario/auth/auth.guard';
import { ProductoController } from './producto.controller';
import { ProductoService } from '../services/producto.service';
import { HistorialPrecioService } from 'src/modules/gestion-productos/historial-precio/application/services/historial-precio.service';

describe('ProductoController', () => {
  let controller: ProductoController;
  let productoService: jest.Mocked<Partial<ProductoService>>;
  let historialPrecioService: jest.Mocked<Partial<HistorialPrecioService>>;

  beforeEach(async () => {
    productoService = {
      actualizarPrecio: jest.fn(),
    };

    historialPrecioService = {
      findByProducto: jest.fn(),
    };

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

  it('should be defined', () => {
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
    });
  });
});
