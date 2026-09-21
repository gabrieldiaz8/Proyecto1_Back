import { BadRequestException } from '@nestjs/common';

export class Denominacion {
  private readonly _valor: string;

  constructor(valor: string) {
    if (typeof valor !== 'string') {
      throw new BadRequestException(
        'La denominación debe ser una cadena de texto.',
      );
    }

    const trimmed = valor.trim();

    if (trimmed.length === 0) {
      throw new BadRequestException(
        'La denominación no puede estar vacía.',
      );
    }

    const formatoValido = /^[\w áéíóúÁÉÍÓÚñÑ.\-/%]+$/;
    if (!formatoValido.test(trimmed)) {
      throw new BadRequestException(
        'La denominación contiene caracteres no permitidos. Solo se aceptan letras, números, espacios y los símbolos: . - / %',
      );
    }

    this._valor = trimmed;
  }

  get valor(): string {
    return this._valor;
  }

  equals(otro: Denominacion): boolean {
    return this._valor === otro._valor;
  }
}
