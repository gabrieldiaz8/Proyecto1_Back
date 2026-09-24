import { MigrationInterface, QueryRunner } from "typeorm";

export class AddSuperLinea1789685493674 implements MigrationInterface {
    name = 'AddSuperLinea1789685493674'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // 1. Crea la tabla SuperLinea
        await queryRunner.query(`CREATE TABLE \`super_linea\` (\`id\` int NOT NULL AUTO_INCREMENT, \`denominacion\` varchar(255) NOT NULL, \`observacion\` text NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deletedAt\` datetime(6) NULL, \`usuarioCreatedId\` int NULL, \`usuarioDeletedId\` int NULL, \`usuarioUpdatedId\` int NULL, \`sistema\` int NOT NULL DEFAULT '0', UNIQUE INDEX \`IDX_9e4184946b687e188250ddefea\` (\`denominacion\`, \`deletedAt\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        
        // 2. INYECTADO: Creamos el registro del sistema "Sin clasificar" (Toma el ID 1)
        // Le asignamos usuarioCreatedId = 1 asumiendo que es el admin por defecto
        await queryRunner.query(`
            INSERT INTO \`super_linea\` (\`denominacion\`, \`observacion\`, \`sistema\`, \`usuarioCreatedId\`)
            VALUES ('Sin clasificar', 'Asignada automáticamente por el sistema a líneas migradas', 1, 1)
        `);

        // 3. INYECTADO: Agregamos la columna pero temporalmente dejamos que sea NULL
        await queryRunner.query(`ALTER TABLE \`linea\` ADD \`superLineaId\` int NULL`);

        // 4. INYECTADO: Actualizamos las líneas existentes (si las hay) para que apunten al 1
        await queryRunner.query(`UPDATE \`linea\` SET \`superLineaId\` = 1`);

        // 5. INYECTADO: Ahora sí, volvemos la columna estricta (NOT NULL) como quería TypeORM
        await queryRunner.query(`ALTER TABLE \`linea\` MODIFY \`superLineaId\` int NOT NULL`);

        // 6. Crea la Clave Foránea
        await queryRunner.query(`ALTER TABLE \`linea\` ADD CONSTRAINT \`FK_5ba40749e46ade98021c5453b79\` FOREIGN KEY (\`superLineaId\`) REFERENCES \`super_linea\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`linea\` DROP FOREIGN KEY \`FK_5ba40749e46ade98021c5453b79\``);
        await queryRunner.query(`ALTER TABLE \`linea\` DROP COLUMN \`superLineaId\``);
        await queryRunner.query(`DROP INDEX \`IDX_9e4184946b687e188250ddefea\` ON \`super_linea\``);
        await queryRunner.query(`DROP TABLE \`super_linea\``);
    }
}
