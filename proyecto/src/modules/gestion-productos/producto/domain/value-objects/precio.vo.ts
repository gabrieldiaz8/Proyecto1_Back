import { BadRequestException } from '@nestjs/common';
import { Costo } from './costo.vo';
import { Porcentaje } from './porcentaje.vo';

export class Precio {
  private readonly _valor: number;

  private constructor(valor: number) {
    this._valor = valor;
  }

  static calcular(costo: Costo, porcentaje: Porcentaje): Precio {
    const valorCalculado = costo.valor * (1 + porcentaje.valor / 100);
    const valorRedondeado = Number(valorCalculado.toFixed(5));

    if (!Number.isFinite(valorRedondeado)) {
      throw new BadRequestException(
        'El precio calculado debe ser un número finito.',
      );
    }

    return new Precio(valorRedondeado);
  }

  get valor(): number {
    return this._valor;
  }

  equals(otro: Precio): boolean {
    return this._valor === otro._valor;
  }
}
