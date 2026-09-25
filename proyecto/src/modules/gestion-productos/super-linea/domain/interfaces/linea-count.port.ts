// Definimos un Puerto para lograr Inversión de Dependencias (DDD).
// SuperLinea define qué necesita, sin importarle quién o cómo lo implementa.
export const I_LINEA_COUNT_PORT = 'ILineaCountPort';

export interface ILineaCountPort {
  existenLineasActivasPara(superLineaId: number): Promise<boolean>;
}
