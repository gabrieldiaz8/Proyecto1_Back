import {
  Inject,
  Injectable,
  Logger,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { CreateSuperLineaDto } from '../../dto/create-super-linea.dto';
import { UpdateSuperLineaDto } from '../../dto/update-super-linea.dto';
import { SuperLinea } from '../../domain/entities/super-linea.entity';
import { ISuperLineaRepository } from '../../domain/interfaces/super-linea.repository.interface';
import { PoliticaEliminacionSuperLinea } from '../../domain/service/politica-eliminacion-super-linea.service';
import { SuperLineaDto } from '../../dto/super-linea.dto';
import { SuperLineaMapper } from '../../mappers/super-linea.mapper';
import { ensureNotSistemaEntity } from 'src/modules/common/utils/atrituto-sistema';
import { Usuario } from 'src/modules/gestion-usuario/usuario/domain/entities/usuario.entity';

@Injectable()
export class SuperLineaService {
  private readonly logger = new Logger(SuperLineaService.name);

  constructor(
    @Inject('ISuperLineaRepository')
    private readonly superLineaRepository: ISuperLineaRepository,
    private readonly politicaEliminacion: PoliticaEliminacionSuperLinea,
  ) {}

  async create(createDto: CreateSuperLineaDto): Promise<SuperLinea> {
    await this.checkDenominacionExists(createDto.denominacion);
    return this.superLineaRepository.create(createDto);
  }

  async findAllFor(denominacion: string): Promise<SuperLineaDto[]> {
    const entidades = await this.superLineaRepository.findAllFor(denominacion);
    return entidades.map(SuperLineaMapper.toDto);
  }

  async findAllListado(): Promise<SuperLineaDto[]> {
    const entidades = await this.superLineaRepository.findAllListado();
    return entidades.map(SuperLineaMapper.toDto);
  }

  async findBy(
    denominacion: string,
    skip: number,
    take: number,
    incluirEliminados: boolean,
  ) {
    const { data, total } = await this.superLineaRepository.findBy(
      denominacion,
      skip,
      take,
      incluirEliminados,
    );
    const dtoData = data.map(SuperLineaMapper.toDto);
    return { data: dtoData, total };
  }

  async findDtoById(id: number): Promise<SuperLineaDto | null> {
    const entity = await this.superLineaRepository.findOne(id);
    if (!entity) return null;
    return SuperLineaMapper.toDto(entity);
  }

  async findByIdConAuditoria(id: number) {
    return this.superLineaRepository.findByIdConAuditoria(id);
  }

  async update(id: number, updateDto: UpdateSuperLineaDto): Promise<SuperLinea> {
    const superLinea = await this.superLineaRepository.findOne(id);
    if (!superLinea) {
      throw new NotFoundException(`SuperLínea con ID ${id} no encontrada`);
    }

    // Regla de negocio: las de sistema (ej. "Sin clasificar") no se editan
    ensureNotSistemaEntity(
      superLinea,
      'No se puede editar esta SuperLínea porque es del sistema.',
    );

    if (
      updateDto.denominacion &&
      updateDto.denominacion.toLowerCase() !== superLinea.denominacion.toLowerCase()
    ) {
      await this.checkDenominacionExists(updateDto.denominacion);
    }

    return this.superLineaRepository.update(id, updateDto);
  }

  async remove(id: number, usuario: Usuario): Promise<SuperLinea> {
    const superLinea = await this.superLineaRepository.findOne(id);
    if (!superLinea) {
      throw new NotFoundException(`SuperLínea con ID ${id} no encontrada`);
    }

    // Regla 1: No se puede eliminar si es del sistema
    ensureNotSistemaEntity(
      superLinea,
      'No se puede eliminar esta SuperLínea porque es requerida por el sistema.',
    );

    // Regla 2: Nuestra Política de Eliminación (Puerto) verificando si hay líneas activas
    const tieneLineas = await this.politicaEliminacion.tieneLineasActivasParaSuperLinea(id);
    if (tieneLineas) {
      throw new ConflictException(
        'No se puede eliminar la SuperLínea porque tiene líneas activas asociadas.',
      );
    }

    return this.superLineaRepository.remove(superLinea, usuario);
  }

  private async checkDenominacionExists(denominacion: string): Promise<void> {
    // Usamos findByDenominacionWith para buscar incluso entre las eliminadas (soft-delete)
    const existingEntity = await this.superLineaRepository.findByDenominacionWith(denominacion);
    if (existingEntity) {
      throw new ConflictException(
        `Ya existe una SuperLínea con la denominación '${denominacion}'.`,
      );
    }
  }
}
