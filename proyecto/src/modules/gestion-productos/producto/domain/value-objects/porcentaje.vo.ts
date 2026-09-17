import { BadRequestException } from '@nestjs/common';

export class Porcentaje {
  private readonly _valor: number;

  constructor(valor: number) {
    if (valor < 0) {
      throw new BadRequestException(
        'El porcentaje no puede ser negativo.',
      );
    }

    this._valor = valor;
  }

  get valor(): number {
    return this._valor;
  }

  equals(otro: Porcentaje): boolean {
    return this._valor === otro._valor;
  }
}
