# Sistema de Gestión de Productos e Inventario - Backend (NestJS + TypeORM + MySQL)

API del **Sistema de Gestión de una Distribuidora**. Expone los servicios REST que dan soporte a la gestión de productos e inventario: administración de **marcas**, **líneas** y **sub-líneas**, **cálculo de precios por margen**, control de **stock** y alertas de stock bajo. Incluye además autenticación por roles (JWT + Google), gestión de clientes, proveedores, personal, usuarios, localidades, condiciones de IVA y auditoría.

La API se consume desde el frontend (`base-gestion-t-front`).

> **Nota de ubicación:** el código de la API vive dentro de la carpeta `proyecto/` de este repositorio. Todos los comandos de esta guía deben ejecutarse desde `Proyecto1_Back/proyecto`.

---

## Stack tecnológico

- **NestJS 11** + **TypeScript 5.7**
- **TypeORM 0.3.22** + **MySQL 8.0** / **mysql2**
- **Autenticación**: JWT + bcrypt, login social con Google (`google-auth-library`)
- **Documentación API**: Swagger / OpenAPI (`@nestjs/swagger`)
- **Validación**: class-validator + class-transformer (whitelist estricto)
- **Archivos**: Multer, Sharp, Tesseract.js (OCR), XLSX
- **Generación de PDFs / reportes**: PDFKit, PDFMake
- **Email**: Nodemailer
- **Testing**: Jest + ts-jest + Supertest
- **Gestor de paquetes**: Yarn
- **Infraestructura**: Docker + Docker Compose

---

## Instalación

### Requisitos previos

Antes de comenzar, asegurarse de tener instaladas las siguientes herramientas:

- **Node.js**: versión 18 o superior.
- **Yarn**: gestor de dependencias utilizado por el proyecto.
- **Git**: para clonar el repositorio.
- **Docker** (opcional, recomendado): para levantar MySQL sin instalarlo localmente.

Se puede verificar la instalación ejecutando:

```bash
node --version
yarn --version
git --version
```

### 1. Clonar el repositorio

```bash
git clone https://github.com/gabrieldiaz8/Proyecto1_Back.git
cd Proyecto1_Back/proyecto
```

### 2. Instalar dependencias

```bash
yarn install
```

### 3. Variables de entorno

La aplicación se configura a través del archivo `.env` (usa `@nestjs/config` y `dotenv`). El origen de datos esperado por TypeORM es el siguiente (variables leídas en `app.module.ts` y `orm.config.ts`):

| Variable | Descripción |
|---|---|
| `DB_HOST` | Host del servidor MySQL |
| `DB_PORT` | Puerto de conexión a MySQL (default `3306`) |
| `DB_USERNAME` | Usuario de la base de datos |
| `DB_PASSWORD` | Contraseña del usuario de la base |
| `DB_DATABASE` | Nombre de la base de datos |
| `DB_TYPE` | Motor de base de datos (usa `mysql`) |
| `DB_SSL` | Conexión SSL `true` |
| `PORT` | Puerto del servidor NestJS (default `3000`) |
| `JWT_SECRET` | Secreto usado para firmar los tokens JWT |
| `JWT_EXPIRATION_ACCESS` | Expiración del token de acceso (ej. `60s`) |
| `JWT_EXPIRATION_REFRESH` | Expiración del token de refresco (ej. `7d`) |
| `PUNTO_VENTA_ACTIVO_ID` | ID del punto de venta activo de la empresa |

Creá un archivo `.env` a partir del siguiente ejemplo (solo placeholders, completalo con tus valores):

```env
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=tu_usuario
DB_PASSWORD=tu_contrasena
DB_DATABASE=tu_db
DB_TYPE=mysql
DB_SSL=tru

PORT=3000
JWT_SECRET=tu_secreto_jwt
JWT_EXPIRATION_ACCESS=60s
JWT_EXPIRATION_REFRESH=7d
PUNTO_VENTA_ACTIVO_ID=1
```

> El archivo `.env` no debe subirse al repositorio. Verificá que esté incluido en el `.gitignore`.

### 4. Base de datos MySQL

- **Usando Docker Compose** (recomendado): levanta MySQL 8.0 (host `localhost`, puerto `3310`), con base de datos inicial y phpMyAdmin en `http://localhost:8081`:

  ```bash
  docker-compose up -d
  ```

- **Manualmente**: creá una base de datos MySQL y configurá las credenciales en `.env`.

La sincronización de esquema con TypeORM está en **`synchronize: false`**; el esquema se maneja por **migraciones** (ver `orm.config.ts` y `src/migrations`):

```bash
# Generar una nueva migración a partir de los cambios de entidades
yarn migration:generate --name=Migracion

# Ejecutar las migraciones pendientes
yarn migration:run

# Revertir la última migración
yarn migration:revert
```

> Con Yarn no es necesario anteponer `--` extra para pasar argumentos a un script (a diferencia de `npm run script -- --arg`). Alcanza con `yarn script --arg`.

### 5. Levantar el proyecto

```bash
# Desarrollo con hot-reload
yarn start:dev
```

La API queda disponible en `http://localhost:3000`, con prefijo global `/api`. Documentación Swagger en `http://localhost:3000/api`.

### 6. Carga inicial de datos (seed)

El proyecto cuenta con una semilla (seed) que permite cargar los datos iniciales necesarios para utilizar la aplicación (roles, usuario admin, provincias, localidades, condiciones de IVA, líneas y marcas de ejemplo).

Una vez iniciado el backend, ejecutar una petición `GET` al siguiente endpoint:

```http
GET http://localhost:3000/api/seed/seed-all
```

Por ejemplo, utilizando `curl`:

```bash
curl http://localhost:3000/api/seed/seed-all
```

También puede ejecutarse desde herramientas como Postman, Insomnia o directamente desde el navegador.

> **Importante:** la semilla debe ejecutarse con el backend ya iniciado y con la base de datos disponible (migraciones corridas).

### Otros scripts

```bash
yarn start         # Iniciar en modo normal
yarn build         # Compilar TypeScript
yarn start:prod    # Ejecutar el build de producción (node dist/main)
yarn lint          # Lint + autofix con ESLint
yarn test          # Tests unitarios (Jest)
yarn test:e2e      # Tests E2E
yarn test:cov      # Cobertura de tests
```

---

## Estructura del proyecto

```
src/
├── main.ts                    # Bootstrap: CORS, pipes, prefijo /api, Swagger
├── app.module.ts              # Módulo raíz (config y TypeORM)
├── migrations/                # Migraciones de base de datos
└── modules/
    ├── gestion-usuario/       # Autenticación (auth), usuarios y roles
    ├── gestion-productos/     # Marcas, líneas, productos, operaciones de producto
    ├── gestion-documentos/    # Búsquedas de documentos
    ├── gestion-sistema/       # Configuración del sistema y auditoría
    ├── organizacion/          # Clientes, proveedores, personal, empresas (y sus operaciones)
    ├── gutil/                 # Provincias, localidades, condiciones y alícuotas de IVA, domicilios
    └── common/                # Filtros globales, pipes, decoradores, seeds, archivos
```

Cada módulo funcional sigue una convención común (arquitectura por capas orientada al dominio):

```
modulo/
├── domain/            # Entidades TypeORM e interfaces
├── application/       # Controllers, servicios y casos de uso
├── infraestructure/   # Repositorios y adaptadores de persistencia
├── dto/               # DTOs validados con class-validator
└── *.module.ts        # Definición del módulo NestJS
```

### Endpoints principales (prefijo `/api`)

Controladores detectados en el proyecto:

| Módulo | Ruta | Operaciones |
|---|---|---|
| Auth | `auth` | `registrar`, `login`, `login-con-google`, `recuperar`, `verificar-codigo`, `cambiar-contrasena` |
| Producto | `producto` | CRUD, `search-by`, `search-by-rapido`, `marca/:id`, `linea/:id`, `:id/audit` |
| Marca | `marca` | CRUD, `search-by`, `:id/audit` |
| Línea | `linea` | CRUD y consultas (líneas/sub-líneas) |
| Cliente | `cliente` | CRUD, `search-by`, `search-by-vendedor`, selects, `:id/audit` |
| Proveedor | `proveedor` | CRUD y consultas |
| Personal | `personal` | CRUD y consultas |
| Usuario | `usuario` | CRUD y gestión de usuarios |
| Rol | `rol` | CRUD de roles |
| Condición IVA / Alícuota IVA / Localidad / Provincia / Domicilio | variadas | CRUD y consultas |
| Configuración sistema | `configuracion-sistema` | Configuración general |
| Auditoría | `auditoria` | Trazabilidad de cambios |
| Operaciones | `*-operacion` | Operaciones complementarias (cliente, proveedor, producto, empresa) |
| Seeds | `seed-*` | Carga de datos iniciales (`GET http://localhost:3000/api/seed/seed-all`) |

La lista completa de rutas y parámetros está documentada en Swagger en `http://localhost:3000/api`.

---

## Troubleshooting (problemas comunes)

- **Error de conexión a MySQL (`ECONNREFUSED`)**: verificar que el contenedor de Docker esté levantado (`docker-compose ps`) o que el servicio MySQL local esté corriendo, y que `DB_HOST`/`DB_PORT` en `.env` coincidan.
- **Error de conexión SSL**: si la base está en la nube, probar `DB_SSL=true` en el `.env`.
- **Puerto 3000 ocupado**: cambiar la variable `PORT` en `.env` o liberar el puerto en uso.
- **Error de CORS desde el frontend**: confirmar que la URL del frontend esté habilitada en la configuración de CORS de `main.ts`.
- **Faltan datos al probar la app**: recordar correr el seed (`/api/seed/seed-all`) después de levantar el backend por primera vez.

---

## URL de despliegue

El backend está publicado en **Render**:

```
https://proyecto1-back-xtni.onrender.com
```

> Swagger disponible en `https://proyecto1-back-xtni.onrender.com/api`