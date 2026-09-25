import { Injectable } from '@nestjs/common';

@Injectable()
export class GeneradorDenominacionService {
  /**
   * Genera la denominación automática de un producto a partir de los nombres
   * de marca, línea y la descripción formateada de su presentación.
   * La denominación resultante se normaliza a mayúsculas para mantener
   * consistencia con la denominación manual (NormalizeDenominacionPipe).
   * Ejemplo: "ARCOR MERMELADAS 400 G"
   */
  generarDenominacion(
    marcaNombre: string,
    lineaNombre: string,
    presentacionDesc?: string,
  ): string {
    const partes = [marcaNombre, lineaNombre, presentacionDesc]
      .map((parte) => (parte ?? '').trim())
      .filter((parte) => parte.length > 0);

    return partes.join(' ').toUpperCase();
  }
}