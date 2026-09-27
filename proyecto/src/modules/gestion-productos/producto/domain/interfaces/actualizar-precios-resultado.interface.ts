export interface ResultadoActualizacionMasiva {
  totalProcesados: number;
  actualizadosExitosamente: number;
  excluidos: Array<{ id: number; denominacion: string; motivo: string }>;
}
