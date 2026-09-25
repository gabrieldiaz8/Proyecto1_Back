import { BadRequestException } from '@nestjs/common';

export class Costo {
  private readonly _valor: number;

  constructor(valor: number) {
    if (typeof valor !== 'number') {
      throw new BadRequestException(
        'El costo debe ser un número.',
      );
    }

    if (!Number.isFinite(valor)) {
      throw new BadRequestException(
        'El costo debe ser un número finito.',
      );
    }

    if (valor < 0) {
      throw new BadRequestException(
        'El costo no puede ser negativo.',
      );
    }

    this._valor = valor;
  }

  get valor(): number {
    return this._valor;
  }

  equals(otro: Costo): boolean {
    return this._valor === otro._valor;
  }
}
