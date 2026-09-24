import { PartialType } from '@nestjs/mapped-types';
import { CreateLineaDto } from './create-linea.dto';
import { IsNotEmpty, IsInt, IsBoolean } from 'class-validator';

export class UpdateLineaDto extends PartialType(CreateLineaDto) {

    @IsBoolean()
    utilizaStockMinimo: boolean;

    updatedAt: Date;

    @IsNotEmpty({ message: 'El usuarioUpdatedId es obligatorio.' })
    @IsInt({ message: 'El usuarioUpdatedId debe ser un número entero.' })
    usuarioUpdatedId: number;
}
