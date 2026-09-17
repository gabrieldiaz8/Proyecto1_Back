import { Linea } from "src/modules/gestion-productos/linea/domain/entities/linea.entity";
import { Column, CreateDateColumn, DeleteDateColumn, Entity, Index, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";


@Entity('super_linea')
@Index(['denominacion', 'deletedAt'], { unique: true })
export class SuperLinea {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'varchar', length: 255 })
    denominacion: string;

    @Column({ type: 'text', nullable: true })
    observacion?: string;

    /*
    Comentado para que no de error por ahora
    @OneToMany(() => Linea, (linea) => linea.superLinea)
    lineas: Linea[]
    */

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @DeleteDateColumn({ nullable: true })
    deletedAt?: Date;

    @Column({ type: 'int', nullable: true })
    usuarioCreatedId?: number; 

    @Column({ type: 'int', nullable: true })
    usuarioDeletedId?: number;
    
    @Column({ type: 'int', nullable: true })
    usuarioUpdatedId?: number;
    
    @Column({ type: 'int', default: 0 })
    sistema: number;
}