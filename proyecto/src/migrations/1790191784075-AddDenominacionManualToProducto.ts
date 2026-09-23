import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddDenominacionManualToProducto1790191784075 implements MigrationInterface {
    name = 'AddDenominacionManualToProducto1790191784075'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`producto\` ADD \`denominacion_manual\` tinyint NOT NULL DEFAULT 0`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`producto\` DROP COLUMN \`denominacion_manual\``);
    }
}