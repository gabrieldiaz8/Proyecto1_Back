import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm'; 
import { IUnitOfWork } from 'src/modules/common/unit-of-work/iunit-of-work.'; 
import { TypeOrmUnitOfWork } from 'src/modules/common/unit-of-work/type-orm-unit-of-works1'; 
import { SuperLinea } from './domain/entities/super-linea.entity';
import { SuperLineaController } from './application/controllers/super-linea.controller';
import { SuperLineaService } from './application/services/super-linea.service';
import { SuperLineaPersistenceAdapter } from './infraestructure/repositories/super-linea.persistence-adapter';
import { PoliticaEliminacionSuperLinea } from './domain/service/politica-eliminacion-super-linea.service';
import { LineaModule } from '../linea/linea.module'; // Importamos el módulo de línea

@Module({
  imports: [
    TypeOrmModule.forFeature([SuperLinea]),
    forwardRef(() => LineaModule), // ACÁ VA EL FORWARD REF
  ],
  controllers: [SuperLineaController],
  providers: [
    SuperLineaService,
    SuperLineaPersistenceAdapter,
    {
      provide: 'ISuperLineaRepository',
      useExisting: SuperLineaPersistenceAdapter,
    },
    PoliticaEliminacionSuperLinea,
    {
      provide: 'UnitOfWork',
      useFactory: (dataSource: DataSource): IUnitOfWork => {
        return new TypeOrmUnitOfWork(dataSource);
      },
      inject: [DataSource],
    },
  ],
  exports: ['ISuperLineaRepository'],
})
export class SuperLineaModule {}
