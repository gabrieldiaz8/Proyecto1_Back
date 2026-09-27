import { describe, it, expect } from '@jest/globals';
import { validate } from 'class-validator';
import { UpdateLineaDto } from './update-linea.dto';

describe('UpdateLineaDto', () => {
  it('debe aceptar un usuarioUpdatedId entero válido', async () => {
    const dto = new UpdateLineaDto();
    dto.usuarioUpdatedId = 5;

    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
  });

  it('debe rechazar usuarioUpdatedId vacío con el mensaje correcto', async () => {
    const dto = new UpdateLineaDto();
    dto.usuarioUpdatedId = undefined as unknown as number;

    const errors = await validate(dto);

    const mensaje = errors.flatMap((e) =>
      Object.values(e.constraints ?? {}),
    );
    expect(mensaje).toContain('El usuarioUpdatedId es obligatorio.');
    expect(mensaje).not.toContain('El usuarioCreatedId es obligatorio.');
  });

  it('debe rechazar usuarioUpdatedId no entero con el mensaje correcto', async () => {
    const dto = new UpdateLineaDto();
    dto.usuarioUpdatedId = 1.5;

    const errors = await validate(dto);

    const mensaje = errors.flatMap((e) =>
      Object.values(e.constraints ?? {}),
    );
    expect(mensaje).toContain(
      'El usuarioUpdatedId debe ser un número entero.',
    );
  });
});