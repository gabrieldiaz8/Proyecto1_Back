import { Inject, Injectable } from '@nestjs/common';
import { ILineaCountPort, I_LINEA_COUNT_PORT } from '../interfaces/linea-count.port';

@Injectable()
export class PoliticaEliminacionSuperLinea {
  constructor(
    @Inject(I_LINEA_COUNT_PORT)
    private readonly lineaCountPort: ILineaCountPort,
  ) {}

  async tieneLineasActivasParaSuperLinea(superLineaId: number): Promise<boolean> {
    return this.lineaCountPort.existenLineasActivasPara(superLineaId);
  }
}
