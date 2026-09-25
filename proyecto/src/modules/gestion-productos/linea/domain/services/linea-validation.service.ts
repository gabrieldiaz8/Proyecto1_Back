import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { ISuperLineaRepository } from "src/modules/gestion-productos/super-linea/domain/interfaces/super-linea.repository.interface";

@Injectable()
export class LineaValidationService {
    constructor(
        @Inject('ISuperLineaRepository') private readonly superLineaRepository: ISuperLineaRepository,
    ) {}

    async validateSuperLineaExists(superLineaId: number): Promise<void> {
        const superLinea = await this.superLineaRepository.findOne(superLineaId);
        if (!superLinea) {
            throw new NotFoundException(`La SuperLinea con ID ${superLineaId} no existe.`);
        }
    }
}