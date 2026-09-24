jest.mock('src/modules/common/decorators/transactional.decoratos', () => ({
  Transactional: () => (target: any, key: string, descriptor: PropertyDescriptor) => descriptor,
}));

import { NotFoundException, BadRequestException } from '@nestjs/common';
import { ProductoPersistenceAdapter } from './producto.persistence-adapters';
import { Producto } from '../../domain/entities/producto.entity';
import { UpdatePrecioDto } from '../../dto/update-precio.dto';
import { Usuario } from 'src/modules/gestion-usuario/usuario/domain/entities/usuario.entity';

describe('ProductoPersistenceAdapter.actualizarPrecio', () => {
  let adapter: ProductoPersistenceAdapter;
  let mockRepo: any;
  let mockUow: any;
  let mockHistorialRepo: any;

  const usuario = { id: 1 } as Usuario;

  const buildDto = (precio?: number): UpdatePrecioDto => ({
    costo: 50,
    costoDolar: 0,
    cotizacionDolar: 0,
    porcentaje: 20,
    usuarioId: 1,
    motivo: 'Ajuste de precio',
    precio,
  });

  beforeEach(() => {
    mockRepo = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };

    mockUow = {
      getRepository: jest.fn().mockReturnValue(mockRepo),
      start: jest.fn(),
      commit: jest.fn(),
      rollback: jest.fn(),
      release: jest.fn(),
    };

    mockHistorialRepo = {
      save: jest.fn(),
      findByProducto: jest.fn(),
    };

    adapter = new ProductoPersistenceAdapter(
      null as any,
      null as any,
      mockUow,
      mockHistorialRepo,
    );

    (adapter as any).uow = mockUow;
  });

  it('guarda el producto y registra historial cuando el precio cambia', async () => {
    const producto = new Producto();
    producto.precio = 100;
    mockRepo.findOne.mockResolvedValue(producto);
    mockRepo.save.mockResolvedValue(producto);

    await adapter.actualizarPrecio(1, buildDto(150), usuario);

    expect(mockRepo.save).toHaveBeenCalled();
    expect(mockHistorialRepo.save).toHaveBeenCalledWith(
      mockUow, 1, 100, 150, 'Ajuste de precio',
    );
  });

  it('guarda el producto pero NO registra historial cuando dto.precio es undefined', async () => {
    const producto = new Producto();
    producto.precio = 100;
    mockRepo.findOne.mockResolvedValue(producto);
    mockRepo.save.mockResolvedValue(producto);

    await adapter.actualizarPrecio(1, buildDto(undefined), usuario);

    expect(mockRepo.save).toHaveBeenCalled();
    expect(mockHistorialRepo.save).not.toHaveBeenCalled();
  });

  it('no llama a ningún save cuando el precio es inválido (<= 0)', async () => {
    const producto = new Producto();
    producto.precio = 100;
    mockRepo.findOne.mockResolvedValue(producto);

    await expect(
      adapter.actualizarPrecio(1, buildDto(0), usuario),
    ).rejects.toThrow(BadRequestException);

    expect(mockRepo.save).not.toHaveBeenCalled();
    expect(mockHistorialRepo.save).not.toHaveBeenCalled();
  });

  it('lanza NotFoundException y no llama a ningún save cuando el producto no existe', async () => {
    mockRepo.findOne.mockResolvedValue(null);

    await expect(
      adapter.actualizarPrecio(1, buildDto(150), usuario),
    ).rejects.toThrow(NotFoundException);

    expect(mockRepo.save).not.toHaveBeenCalled();
    expect(mockHistorialRepo.save).not.toHaveBeenCalled();
  });
});
