import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { ILineaCountPort } from "src/modules/gestion-productos/super-linea/domain/interfaces/linea-count.port";
import { Linea } from "../../domain/entities/linea.entity";
import { IsNull, Repository } from "typeorm";

@Injectable()
export class LineaCountAdapter implements ILineaCountPort{
    constructor(
        @InjectRepository(Linea)
        private readonly repository: Repository<Linea>
    ){}

    async existenLineasActivasPara(superLineaId: number): Promise<boolean> {
        const count = await this.repository.count({
            where: {
                superLineaId,
                deletedAt: IsNull()
            },
        });
        return count > 0;
    }
}