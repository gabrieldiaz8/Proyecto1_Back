// domain/services/producto-intrinsic-validation.service.ts
import { Injectable, BadRequestException } from '@nestjs/common';
import { UnidadMedida } from '../enums/unidad-medida.enum';
import { Presentacion } from '../value-objects/presentacion.vo';

@Injectable()
export class ProductoIntrinsicValidationService {
  /**
   * Valida todos los datos intrínsecos del producto
   */
  validarDatosBasicos(datos: {
    denominacion: string;
    marcaId: number;
    lineaId: number;
    alicuotaIva?: number;
    presentacionCantidad?: number | null;
    presentacionUnidadMedida?: UnidadMedida | null;
  }): void {
    this.validarDenominacion(datos.denominacion);
    this.validarIds(datos.marcaId, datos.lineaId);

    if (datos.alicuotaIva !== undefined) {
      this.validarAlicuotaIva(datos.alicuotaIva);
    }

    if (
      datos.presentacionCantidad !== undefined ||
      datos.presentacionUnidadMedida !== undefined
    ) {
      this.validarPresentacion(
        datos.presentacionCantidad,
        datos.presentacionUnidadMedida,
      );
    }
  }

  private validarPresentacion(
    cantidad?: number | null,
    unidadMedida?: UnidadMedida | null,
  ): void {
    const envioIncompleto =
      (cantidad === undefined || cantidad === null) !==
        (unidadMedida === undefined || unidadMedida === null) ||
      (cantidad === null) !== (unidadMedida === null);

    if (envioIncompleto) {
      throw new BadRequestException(
        'La cantidad y unidad de medida de la presentación deben enviarse juntas',
      );
    }

    if (cantidad === null || unidadMedida === null) {
      return; // borrado explícito de la presentación
    }

    new Presentacion(cantidad as number, unidadMedida as UnidadMedida);
  }

  private validarDenominacion(denominacion: string): void {
    if (!denominacion || denominacion.trim().length === 0) {
      throw new BadRequestException('La denominación es obligatoria');
    }
    if (denominacion.length > 200) {
      throw new BadRequestException(
        'La denominación no puede superar 200 caracteres',
      );
    }
  }

  private validarIds(
    marcaId: number,
    lineaId: number,
  ): void {
    if (!marcaId || marcaId <= 0) {
      throw new BadRequestException('Marca ID es requerido y debe ser válido');
    }
    if (!lineaId || lineaId <= 0) {
      throw new BadRequestException('Línea ID es requerido y debe ser válido');
    }

  }

  private validarAlicuotaIva(alicuotaIva: number): void {
    if (alicuotaIva < 0 || alicuotaIva > 100) {
      throw new BadRequestException(
        'La alícuota IVA debe estar entre 0 y 100',
      );
    }
  }
}