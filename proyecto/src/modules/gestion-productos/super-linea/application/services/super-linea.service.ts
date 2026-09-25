import {
  ConflictException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ensureNotSistemaEntity } from 'src/modules/common/utils/atrituto-sistema';
import { UsuarioService } from 'src/modules/gestion-usuario/usuario/application/services/usuario.service';
import { PaginacionUtils } from 'src/modules/common/utils/pagination/paginacion-utils';
import { MessageFrontUtils } from 'src/modules/common/utils/message/message-front.util';
import { ISuperLineaRepository } from '../../domain/interfaces/super-linea.repository.interface';
import { UpdateSuperLineaDto } from '../../dto/update-super-linea.dto';
import { CreateSuperLineaDto } from '../../dto/create-super-linea.dto';
import { SuperLineaDto } from '../../dto/super-linea.dto';
import { SuperLineaMapper } from '../../mappers/super-linea.mapper';
import { PoliticaEliminacionSuperLinea } from '../../domain/service/politica-eliminacion-super-linea.service';
import { SuperLinea } from '../../domain/entities/super-linea.entity';

@Injectable()
export class SuperLineaService {
  private readonly logger = new Logger(SuperLineaService.name);
  constructor(
    @Inject('ISuperLineaRepository')
    private readonly repository: ISuperLineaRepository,
    private readonly usuarioService: UsuarioService,
    private readonly politicaEliminacion: PoliticaEliminacionSuperLinea,
  ) {}

  private readonly ENTITY_NAME = 'SuperLínea';

  async create(dto: CreateSuperLineaDto) {
    this.logger.log(
      `Creando un nuevo ${this.ENTITY_NAME} con denominación: ${dto.denominacion}`,
    );
    await this.checkDenominacionExists(dto.denominacion, 0);
    await this.repository.create(dto);

    return MessageFrontUtils.createSimple(
      `${this.ENTITY_NAME}`,
      dto.denominacion,
      'creada',
    );
  }

  async update(id: number, dto: UpdateSuperLineaDto) {
    this.logger.log(`Actualizando ${this.ENTITY_NAME} con ID: ${id}`);
    const superLinea = await this.findEntityById(id);
    ensureNotSistemaEntity(superLinea, 'SuperLínea');

    if (dto.denominacion) {
      await this.checkDenominacionExists(dto.denominacion, id);
    }

    const entity = await this.repository.update(id, dto);
    return MessageFrontUtils.createSimple(
      `${this.ENTITY_NAME}`,
      entity.denominacion,
      'editada',
    );
  }

  async findAllFor(
    denominacion: string,
  ): Promise<{ data: SuperLineaDto[]; total: number }> {
    const result = await this.repository.findAllFor(denominacion);
    const data: SuperLineaDto[] = result.map((sl) => SuperLineaMapper.toDto(sl));
    return {
      data,
      total: 1,
    };
  }

  async findAllListado(): Promise<SuperLinea[]> {
    const result = await this.repository.findAllListado();
    return result;
  }

  async findAllSinSistemaFor(
    denominacion: string,
  ): Promise<{ data: SuperLineaDto[]; total: number }> {
    const result = await this.repository.findAllSinSistemaFor(denominacion);
    const data: SuperLineaDto[] = result.map((sl) => SuperLineaMapper.toDto(sl));
    return {
      data,
      total: 1,
    };
  }

  async findAllSistemaFor(
    denominacion: string,
  ): Promise<{ data: SuperLineaDto[]; total: number }> {
    const result = await this.repository.findAllSistemaFor(denominacion);
    const data: SuperLineaDto[] = result.map((sl) => SuperLineaMapper.toDto(sl));
    return {
      data,
      total: 1,
    };
  }

  async findBy(
    denominacion: string,
    skip = 0,
    take = 10,
    incluirEliminados = false,
  ): Promise<{ data: SuperLineaDto[]; total: number }> {
    this.logger.log(
      `Buscando ${this.ENTITY_NAME} ${denominacion} skip=${skip}, take=${take}`,
    );
    const result = await this.repository.findBy(
      denominacion,
      skip,
      take,
      incluirEliminados,
    );
    const data: SuperLineaDto[] = result.data.map((sl) =>
      SuperLineaMapper.toDto(sl),
    );
    return {
      data,
      total: PaginacionUtils.totalItems(result.total),
    };
  }

  async findDtoById(id: number) {
    const entity = await this.repository.findOne(id);
    if (!entity)
      throw new NotFoundException(
        `${this.ENTITY_NAME} con ID ${id} no encontrado.`,
      );
    return SuperLineaMapper.toDto(entity);
  }

  async findEntityById(id: number) {
    const entity = await this.repository.findOne(id);
    if (!entity)
      throw new NotFoundException(
        `${this.ENTITY_NAME} con ID ${id} no encontrado.`,
      );
    return entity;
  }

  async remove(id: number, usuarioId: number) {
    const entity = await this.repository.findOne(id);

    if (!entity) {
      throw new NotFoundException(
        `${this.ENTITY_NAME} con ID ${id} no encontrado.`,
      );
    }

    ensureNotSistemaEntity(entity, 'SuperLínea');

    const tieneLineasActivas =
      await this.politicaEliminacion.tieneLineasActivasParaSuperLinea(id);

    if (tieneLineasActivas) {
      throw new ConflictException(
        'No se puede eliminar la SuperLínea porque tiene líneas activas asociadas.',
      );
    }

    const usuario = await this.usuarioService.findOne(usuarioId);
    if (!usuario) {
      throw new NotFoundException(`Usuario con ID ${usuarioId} no encontrado.`);
    }
    await this.repository.remove(entity, usuario);

    return MessageFrontUtils.createSimple(
      `${this.ENTITY_NAME}`,
      entity.denominacion,
      'eliminada',
    );
  }

  private async checkDenominacionExists(denominacion: string, id: number) {
    const exists = await this.repository.findByDenominacionWith(denominacion);
    if (exists && exists.id !== id) {
      this.logger.warn(
        `${this.ENTITY_NAME} Conflicto: denominación ya está en uso: ${denominacion}`,
      );
      throw new ConflictException('Denominación ya en uso.');
    }
  }

  async findByIdConAuditoria(id: number) {
    const entity = await this.repository.findByIdConAuditoria(id);
    if (!entity)
      throw new NotFoundException(
        `${this.ENTITY_NAME} con ID ${id} no encontrado.`,
      );
    return entity;
  }
}