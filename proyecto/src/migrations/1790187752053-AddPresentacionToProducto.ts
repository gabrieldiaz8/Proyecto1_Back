import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPresentacionToProducto1790187752053 implements MigrationInterface {
    name = 'AddPresentacionToProducto1790187752053'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`producto\` ADD \`presentacion_cantidad\` decimal(12,3) NULL`);
        await queryRunner.query(`ALTER TABLE \`producto\` ADD \`presentacion_unidad_medida\` varchar(20) NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`producto\` DROP COLUMN \`presentacion_unidad_medida\``);
        await queryRunner.query(`ALTER TABLE \`producto\` DROP COLUMN \`presentacion_cantidad\``);
    }
}