import { MigrationInterface, QueryRunner } from 'typeorm';

export class BackfillPresentacionProducto1790440021449 implements MigrationInterface {
    name = 'BackfillPresentacionProducto1790440021449'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // TODO: confirmar valor por defecto real con el equipo (CR-002 Criterio 5)
        // 1 y 'UN' son PLACEHOLDERS provisionales para poder desambiguar la
        // denominacion automatica (CR-005) en los productos que ya existian
        // cuando se agrego la columna. Reemplazar por el valor que defina el
        // equipo antes de aplicar en produccion.
        await queryRunner.query(`UPDATE \`producto\` SET \`presentacion_cantidad\` = 1 WHERE \`presentacion_cantidad\` IS NULL`);
        await queryRunner.query(`UPDATE \`producto\` SET \`presentacion_unidad_medida\` = 'UN' WHERE \`presentacion_unidad_medida\` IS NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // La 1790187752053-AddPresentacionToProducto dejo estas columnas en NULL,
        // por lo que el rollback de este backfill es volverlas a NULL.
        await queryRunner.query(`UPDATE \`producto\` SET \`presentacion_cantidad\` = NULL WHERE \`presentacion_cantidad\` = 1`);
        await queryRunner.query(`UPDATE \`producto\` SET \`presentacion_unidad_medida\` = NULL WHERE \`presentacion_unidad_medida\` = 'UN'`);
    }
}
