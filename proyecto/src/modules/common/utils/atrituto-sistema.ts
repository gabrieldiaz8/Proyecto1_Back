import { ForbiddenException } from "@nestjs/common";

export interface SistemaEntity {
  sistema?: number;
}

import { TipoRegistro } from "../enums/tipo-registro.enum";

export function ensureNotSistemaEntity(entity: SistemaEntity, entityName: string) {
  if (entity.sistema === TipoRegistro.SISTEMA) {
    throw new ForbiddenException(`${entityName} marcado como del sistema y no puede ser modificado o eliminado`);
  }
}