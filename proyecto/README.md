# Proyecto Backend - Gestión Distribuidora

## 🚀 Configuración Inicial

### 1. Instalar dependencias
```bash
yarn install
```

### 2. Configurar archivo .env
Copia el archivo `.env.example` como `.env` y ajusta la configuración según tu entorno:

```bash
cp .env.example .env
```

El archivo `.env` **NO se sube al repositorio** (está en `.gitignore`), así cada desarrollador tiene su propia configuración.

### 3. Levantar Base de Datos Local (Docker)
```bash
docker compose -p proyecto up -d
```

Esto levanta:
- **MySQL**: `localhost:3310`
  - Usuario: `admin`
  - Contraseña: `admin`
  - Base de datos: `proyecto`
- **phpMyAdmin**: `http://localhost:8081`

### 4. Ejecutar Migraciones
```bash
yarn migration:run
```

Esto creará todas las tablas necesarias en la base de datos.

---

## 📝 Comandos Disponibles

### Desarrollo
```bash
yarn start:dev        # Inicia el servidor en modo desarrollo (watch)
yarn start:debug      # Inicia el servidor en modo debug
```

### Migraciones
```bash
yarn migration:run              # Ejecuta migraciones pendientes
yarn migration:revert           # Revierte la última migración
yarn migration:generate nombre  # Genera una nueva migración
```

### Docker
```bash
docker compose -p proyecto up -d      # Inicia los contenedores
docker compose -p proyecto down       # Detiene los contenedores
docker compose -p proyecto logs       # Ver logs
```

### Testing
```bash
yarn test              # Ejecuta tests
yarn test:watch        # Tests en modo watch
yarn test:cov          # Tests con cobertura
```

### Otros
```bash
yarn lint              # Ejecuta el linter
yarn format            # Formatea el código
yarn build             # Compila el proyecto
```

---

## 🗄️ Base de Datos

Existen dos opciones de configuración:

### Opción 1: Local (Desarrollo) - Por defecto
Usa Docker Compose con MySQL local
```env
DB_PORT=3310
DB_HOST="localhost"
DB_USERNAME="admin"
DB_PASSWORD="admin"
DB_DATABASE="proyecto"
```

### Opción 2: Remota (Producción)
Usa base de datos en Aiven Cloud
```env
DB_PORT=16357
DB_HOST="mysql-XXXXX.aivencloud.com"
DB_USERNAME="avnadmin"
DB_PASSWORD="tu_password"
DB_DATABASE="defaultdb"
```

---

## 📚 Documentación API

Una vez iniciado el servidor, la documentación Swagger está disponible en:
```
http://localhost:3000/api
```

---

## ⚠️ Importante

- El archivo `.env` **NO se sube al repositorio**
- Cada desarrollador configura su propio `.env` según su entorno
- Por defecto, usa la base de datos local de Docker
- Para producción/deploy, configurar con las credenciales de Aiven
