import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateHistorialPrecio1787269586539 implements MigrationInterface {
    name = 'CreateHistorialPrecio1787269586539'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`historial_precio\` (\`id\` int NOT NULL AUTO_INCREMENT, \`precioAnterior\` decimal(15,5) NOT NULL, \`precioNuevo\` decimal(15,5) NOT NULL, \`motivo\` text NOT NULL, \`fechaCambio\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`producto_id\` int NOT NULL, INDEX \`IDX_historial_precio_producto_fecha\` (\`producto_id\`, \`fechaCambio\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`historial_precio\` ADD CONSTRAINT \`FK_historial_precio_producto\` FOREIGN KEY (\`producto_id\`) REFERENCES \`producto\`(\`id\`) ON DELETE RESTRICT ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`historial_precio\` DROP FOREIGN KEY \`FK_historial_precio_producto\``);
        await queryRunner.query(`DROP INDEX \`IDX_historial_precio_producto_fecha\` ON \`historial_precio\``);
        await queryRunner.query(`DROP TABLE \`historial_precio\``);
    }

}
