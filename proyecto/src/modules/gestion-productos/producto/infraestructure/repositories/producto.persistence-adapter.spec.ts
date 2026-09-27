jest.mock('src/modules/common/decorators/transactional.decoratos', () => ({
  Transactional: () => (target: any, key: string, descriptor: PropertyDescriptor) => descriptor,
}));

import { NotFoundException, BadRequestException } from '@nestjs/common';
import { ProductoPersistenceAdapter } from './producto.persistence-adapters';
import { Producto } from '../../domain/entities/producto.entity';
import { UpdatePrecioDto } from '../../dto/update-precio.dto';
import { ActualizarPreciosMasivoDto } from '../../dto/actualizar-precios-masivo.dto';
import {
  AlcanceAjustePrecio,
  ModalidadAjustePrecio,
  TipoAjustePrecio,
} from '../../enums/ajuste-precio.enum';
import { DatabaseConnectionException } from 'src/modules/common/exceptions/database-connection.exception';
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

    const mockGeneradorDenominacion = {
      generarDenominacion: jest.fn(),
    };

    adapter = new ProductoPersistenceAdapter(
      null as any,
      null as any,
      mockUow,
      mockGeneradorDenominacion as any,
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

// ---------------------------------------------------------------------------
// CR-007: auditoría de precio en la edición general y en el ajuste masivo
// ---------------------------------------------------------------------------

interface AdapterHarness {
  adapter: ProductoPersistenceAdapter;
  /** Repo que se obtiene vía uow.getRepository(), dentro de la transacción. */
  mockRepoUow: any;
  /** Repo inyectado por @InjectRepository, fuera de la transacción. */
  mockRepoInyectado: any;
  mockUow: any;
  mockHistorialRepo: any;
}

function crearHarness(): AdapterHarness {
  const mockRepoUow: any = {
    findOne: jest.fn(),
    save: jest.fn(),
  };

  const mockRepoInyectado: any = {
    save: jest.fn(),
    find: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const mockUow: any = {
    getRepository: jest.fn().mockReturnValue(mockRepoUow),
    start: jest.fn(),
    commit: jest.fn(),
    rollback: jest.fn(),
    release: jest.fn(),
  };

  const mockHistorialRepo: any = {
    save: jest.fn(),
    findByProducto: jest.fn(),
  };

  const adapter = new ProductoPersistenceAdapter(
    mockRepoInyectado as any,
    null as any,
    mockUow,
    { generarDenominacion: jest.fn() } as any,
    mockHistorialRepo,
  );

  (adapter as any).uow = mockUow;

  return { adapter, mockRepoUow, mockRepoInyectado, mockUow, mockHistorialRepo };
}

function productoConPrecio(id: number, precio: number): Producto {
  const p = new Producto();
  p.id = id;
  p.precio = precio;
  return p;
}

function crearDtoMasivo(
  tipoAjuste: TipoAjustePrecio,
  modalidad: ModalidadAjustePrecio,
  valor: number,
): ActualizarPreciosMasivoDto {
  const dto = new ActualizarPreciosMasivoDto();
  dto.tipoAjuste = tipoAjuste;
  dto.modalidad = modalidad;
  dto.valor = valor;
  dto.alcance = AlcanceAjustePrecio.GLOBAL;
  return dto;
}

describe('ProductoPersistenceAdapter.save — auditoría de precio', () => {
  let h: AdapterHarness;

  beforeEach(() => {
    h = crearHarness();
    h.mockRepoUow.save.mockImplementation(async (p: Producto) => p);
  });

  it('registra historial cuando la edición general recalcula el precio', async () => {
    const producto = productoConPrecio(7, 125);
    h.mockRepoUow.findOne.mockResolvedValue({ id: 7, precio: 100 });

    await h.adapter.save(producto);

    expect(h.mockHistorialRepo.save).toHaveBeenCalledWith(
      h.mockUow,
      7,
      100,
      125,
      'Modificado desde edición general de producto',
    );
  });

  it('lee el precio de base con una lectura parcial de solo id y precio', async () => {
    const producto = productoConPrecio(7, 125);
    h.mockRepoUow.findOne.mockResolvedValue({ id: 7, precio: 100 });

    await h.adapter.save(producto);

    expect(h.mockRepoUow.findOne).toHaveBeenCalledWith({
      where: { id: 7 },
      select: { id: true, precio: true },
    });
  });

  it('no registra historial cuando la edición no cambia el precio', async () => {
    const producto = productoConPrecio(7, 100);
    producto.denominacion = 'Sólo cambió la denominación';
    h.mockRepoUow.findOne.mockResolvedValue({ id: 7, precio: 100 });

    await h.adapter.save(producto);

    expect(h.mockRepoUow.save).toHaveBeenCalledWith(producto);
    expect(h.mockHistorialRepo.save).not.toHaveBeenCalled();
  });

  it('no registra historial en un alta, porque no hay precio anterior', async () => {
    const producto = productoConPrecio(0, 250);
    delete (producto as any).id;

    await h.adapter.save(producto);

    // En un alta ni siquiera se consulta el precio en base.
    expect(h.mockRepoUow.findOne).not.toHaveBeenCalled();
    expect(h.mockRepoUow.save).toHaveBeenCalledWith(producto);
    expect(h.mockHistorialRepo.save).not.toHaveBeenCalled();
  });

  it('no registra historial si no encuentra el precio en base', async () => {
    const producto = productoConPrecio(7, 125);
    h.mockRepoUow.findOne.mockResolvedValue(null);

    await h.adapter.save(producto);

    expect(h.mockRepoUow.save).toHaveBeenCalledWith(producto);
    expect(h.mockHistorialRepo.save).not.toHaveBeenCalled();
  });

  it('no deja historial a medias si falla la escritura del producto', async () => {
    const producto = productoConPrecio(7, 125);
    h.mockRepoUow.findOne.mockResolvedValue({ id: 7, precio: 100 });
    h.mockRepoUow.save.mockRejectedValue(new Error('connection lost'));

    await expect(h.adapter.save(producto)).rejects.toThrow(
      DatabaseConnectionException,
    );
    expect(h.mockHistorialRepo.save).not.toHaveBeenCalled();
  });
});

describe('ProductoPersistenceAdapter.saveMany — auditoría de precio', () => {
  let h: AdapterHarness;

  beforeEach(() => {
    h = crearHarness();
    h.mockRepoUow.save.mockImplementation(async (p: Producto[]) => p);
  });

  it('guarda el lote vía uow y no por el repository inyectado', async () => {
    const productos = [productoConPrecio(1, 110)];

    await h.adapter.saveMany(productos);

    expect(h.mockUow.getRepository).toHaveBeenCalledWith(Producto);
    expect(h.mockRepoUow.save).toHaveBeenCalledWith(productos);
    expect(h.mockRepoInyectado.save).not.toHaveBeenCalled();
  });

  it('registra un historial por producto con el motivo armado desde el dto', async () => {
    const previos = new Map([[1, 100], [2, 200]]);

    await h.adapter.saveMany(
      [productoConPrecio(1, 115), productoConPrecio(2, 230)],
      previos,
      crearDtoMasivo(
        TipoAjustePrecio.AUMENTO,
        ModalidadAjustePrecio.PORCENTAJE,
        15,
      ),
    );

    expect(h.mockHistorialRepo.save).toHaveBeenCalledTimes(2);
    expect(h.mockHistorialRepo.save).toHaveBeenNthCalledWith(
      1,
      h.mockUow,
      1,
      100,
      115,
      'Ajuste masivo — AUMENTO PORCENTAJE 15%',
    );
    expect(h.mockHistorialRepo.save).toHaveBeenNthCalledWith(
      2,
      h.mockUow,
      2,
      200,
      230,
      'Ajuste masivo — AUMENTO PORCENTAJE 15%',
    );
  });

  it('omite el símbolo de porcentaje cuando la modalidad es por monto', async () => {
    await h.adapter.saveMany(
      [productoConPrecio(1, 80)],
      new Map([[1, 100]]),
      crearDtoMasivo(
        TipoAjustePrecio.DISMINUCION,
        ModalidadAjustePrecio.MONTO,
        20,
      ),
    );

    expect(h.mockHistorialRepo.save).toHaveBeenCalledWith(
      h.mockUow,
      1,
      100,
      80,
      'Ajuste masivo — DISMINUCION MONTO 20',
    );
  });

  it('persiste el lote pero no audita los productos sin cambio de precio', async () => {
    const sinCambio = productoConPrecio(1, 100);
    const conCambio = productoConPrecio(2, 90);

    await h.adapter.saveMany(
      [sinCambio, conCambio],
      new Map([[1, 100], [2, 100]]),
      crearDtoMasivo(
        TipoAjustePrecio.DISMINUCION,
        ModalidadAjustePrecio.MONTO,
        10,
      ),
    );

    expect(h.mockRepoUow.save).toHaveBeenCalledWith([sinCambio, conCambio]);
    expect(h.mockHistorialRepo.save).toHaveBeenCalledTimes(1);
    expect(h.mockHistorialRepo.save).toHaveBeenCalledWith(
      h.mockUow,
      2,
      100,
      90,
      'Ajuste masivo — DISMINUCION MONTO 10',
    );
  });

  it('no audita al producto excluido y sigue con el resto del lote', async () => {
    // El id 2 se excluyó en el loop del service: no llega al array ni al mapa.
    await h.adapter.saveMany(
      [productoConPrecio(1, 980)],
      new Map([[1, 1000]]),
      crearDtoMasivo(
        TipoAjustePrecio.DISMINUCION,
        ModalidadAjustePrecio.MONTO,
        20,
      ),
    );

    expect(h.mockHistorialRepo.save).toHaveBeenCalledTimes(1);
    expect(h.mockHistorialRepo.save).toHaveBeenCalledWith(
      h.mockUow,
      1,
      1000,
      980,
      'Ajuste masivo — DISMINUCION MONTO 20',
    );
  });

  it('no audita nada si el service no informa precios anteriores', async () => {
    const productos = [productoConPrecio(1, 110)];

    await h.adapter.saveMany(productos);

    expect(h.mockRepoUow.save).toHaveBeenCalledWith(productos);
    expect(h.mockHistorialRepo.save).not.toHaveBeenCalled();
  });

  it('no deja historial a medias si falla el guardado del lote', async () => {
    h.mockRepoUow.save.mockRejectedValue(new Error('boom'));

    await expect(
      h.adapter.saveMany(
        [productoConPrecio(1, 115)],
        new Map([[1, 100]]),
        crearDtoMasivo(
          TipoAjustePrecio.AUMENTO,
          ModalidadAjustePrecio.PORCENTAJE,
          15,
        ),
      ),
    ).rejects.toThrow('boom');

    expect(h.mockHistorialRepo.save).not.toHaveBeenCalled();
  });
});
