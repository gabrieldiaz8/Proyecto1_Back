import { BadRequestException } from '@nestjs/common';
import { UnidadMedida } from '../enums/unidad-medida.enum';

export class Presentacion {
  private readonly _cantidad: number;
  private readonly _unidadMedida: UnidadMedida;

  constructor(cantidad: number, unidadMedida: UnidadMedida) {
    this.validarCantidad(cantidad);
    this.validarUnidadMedida(unidadMedida);

    this._cantidad = cantidad;
    this._unidadMedida = unidadMedida;
  }

  get cantidad(): number {
    return this._cantidad;
  }

  get unidadMedida(): UnidadMedida {
    return this._unidadMedida;
  }

  getDescripcionFormateada(): string {
    return `${this._cantidad} ${this._unidadMedida}`;
  }

  toString(): string {
    return this.getDescripcionFormateada();
  }

  private validarCantidad(cantidad: number): void {
    if (
      typeof cantidad !== 'number' ||
      !Number.isFinite(cantidad) ||
      cantidad <= 0
    ) {
      throw new BadRequestException(
        'La cantidad de la presentación debe ser un número mayor a 0.',
      );
    }
  }

  private validarUnidadMedida(unidadMedida: UnidadMedida): void {
    if (!Object.values(UnidadMedida).includes(unidadMedida)) {
      throw new BadRequestException('La unidad de medida es inválida.');
    }
  }
}