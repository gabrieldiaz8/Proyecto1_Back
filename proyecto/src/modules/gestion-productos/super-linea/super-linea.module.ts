import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SuperLinea } from './domain/entities/super-linea.entity';
import { SuperLineaController } from './application/controllers/super-linea.controller';
import { SuperLineaService } from './application/services/super-linea.service';
import { SuperLineaPersistenceAdapter } from './infraestructure/repositories/super-linea.persistence-adapter';
import { PoliticaEliminacionSuperLinea } from './domain/service/politica-eliminacion-super-linea.service';
// Si usás un UnitOfWork en tu proyecto, asegurate de importar su módulo acá (ej: DatabaseModule o UnitOfWorkModule)

@Module({
  imports: [
    TypeOrmModule.forFeature([SuperLinea]),
    // EJEMPLO: UnitOfWorkModule, <-- Descomentá si hace falta para que inyecte IUnitOfWork
  ],
  controllers: [SuperLineaController],
  providers: [
    SuperLineaService,
    SuperLineaPersistenceAdapter,
    {
      // Enlazamos la interfaz con la implementación real (El Adapter que arreglaste)
      provide: 'ISuperLineaRepository',
      useExisting: SuperLineaPersistenceAdapter,
    },
    PoliticaEliminacionSuperLinea,
  ],
  exports: [
    // Exportamos el puerto para que LineaModule pueda usarlo en el próximo commit
    'ISuperLineaRepository',
  ],
})
export class SuperLineaModule {}
