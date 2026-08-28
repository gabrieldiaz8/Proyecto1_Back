# Endpoints del Backend — Proyecto1

> ⚠️ **Importante:** todas las rutas están montadas bajo el prefijo global **`/api`** (`app.setGlobalPrefix('api')` en NestJS). Verificar que el front incluya `/api` en cada llamada.

Base URL (Render): `https://proyecto1-back-xtni.onrender.com`

---

## Convenciones generales del cuerpo (JSON)

- **POST** → crea. El campo `usuarioCreatedId` (int) es **obligatorio** en casi todos los DTO de creación.
- **PUT** → actualiza. Los campos de creación normalmente dejan de ser obligatorios (salvo `usuarioUpdatedId` y los que se re-declaran como requeridos).
- **Campos opcionales** marcados con `(opcional)`.
- Los campos `createdAt`, `updatedAt`, `deletedAt` no llevan validación y, salvo excepción, no hacen falta enviarlos.
- `denominacion` suele transformarse a minúsculas y recortarse al recibirse.

---

## AppController — `/api`
| Método | Ruta | Cuerpo (JSON) |
|---|---|---|
| GET | `/api` | — |

---

## MarcaController — `/api/marca`
| Método | Ruta | Cuerpo (JSON) |
|---|---|---|
| POST | `/api/marca` | Ver ejemplo abajo |
| GET | `/api/marca/search-by` | — (query) |
| GET | `/api/marca/:id` | — |
| PUT | `/api/marca/:id` | Ver ejemplo abajo |
| DELETE | `/api/marca/:id` | — (query: `usuarioId`) |
| GET | `/api/marca/:id/audit` | — |

**POST `/api/marca`** — `CreateMarcaDto`:

```json
{
  "denominacion": "Marca A",        // string, REQUERIDO
  "observacion": "Opcional",        // string, opcional
  "usuarioCreatedId": 1             // número, REQUERIDO
}
```

**PUT `/api/marca/:id`** — `UpdateMarcaDto` (todos los campos de create opcionales):

```json
{
  "denominacion": "Marca A",
  "observacion": "Opcional",
  "usuarioCreatedId": 1,
  "usuarioUpdatedId": 2             // número, REQUERIDO
}
```

> **Queries:** `search-by` → `?denominacion=&skip=0&take=10` | `DELETE` → `?usuarioId=` (requerido)

---

## UsuarioController — `/api/usuario`
| Método | Ruta | Cuerpo (JSON) |
|---|---|---|
| GET | `/api/usuario/search-by` | — (query) |
| GET | `/api/usuario` | — (query paginación) |
| GET | `/api/usuario/:id` | — |
| GET | `/api/usuario/search` | — (query) |
| PATCH | `/api/usuario/cambiar-contrasena/:id` | Ver ejemplo abajo |
| PUT | `/api/usuario/:id` | Ver ejemplo abajo |
| DELETE | `/api/usuario/:id` | — |

**PATCH `/api/usuario/cambiar-contrasena/:id`** — `UpdateContrasenaDto`:

```json
{
  "contrasenaActual": "claveActual",   // string, REQUERIDO
  "contrasenaNueva": "nuevaClave123",  // string, REQUERIDO (mín. 8)
  "confirmarContrasena": "nuevaClave123" // string, REQUERIDO
}
```

**PUT `/api/usuario/:id`** — `UpdateUsuarioDto`:

```json
{
  "usuarioUpdatedId": 2,        // número, REQUERIDO
  "mail": "usuario@mail.com",   // opcional
  "denominacion": "Juan Perez", // opcional
  "rolesIds": [1, 2]            // número[], opcional
}
```

> **Queries:** `search-by` → `?empresaId=&denominacion=&skip=0&take=10` (con `empresaId` y `take` con valores por defecto) | `GET /usuario` y `/search` → `?denominacion=&skip=&take=`

---

## RolController — `/api/rol`
| Método | Ruta | Cuerpo (JSON) |
|---|---|---|
| POST | `/api/rol` | Ver ejemplo abajo |
| GET | `/api/rol` | — (query) |
| GET | `/api/rol/:id` | — |
| GET | `/api/rol/search` | — (query) |
| PUT | `/api/rol/:id` | Ver ejemplo abajo |
| DELETE | `/api/rol/:id` | — |

**POST `/api/rol`** — `CreateRolDto`:

```json
{
  "denominacion": "Vendedor",  // string, REQUERIDO
  "observacion": "Opcional"    // string, opcional
}
```

**PUT `/api/rol/:id`** — `UpdateRolDto` (todos opcionales):

```json
{
  "denominacion": "Vendedor",
  "observacion": "Opcional"
}
```

> **Queries:** `GET /rol` y `/search` → `?denominacion=&skip=&take=`

---

## ProductoController — `/api/producto`
| Método | Ruta | Cuerpo (JSON) |
|---|---|---|
| POST | `/api/producto` | Ver ejemplo abajo |
| GET | `/api/producto/find-all-for-marcas/select` | — (query) |
| GET | `/api/producto/find-all-for-lineas/select` | — (query) |
| GET | `/api/producto/search-by-rapido` | — (query) |
| GET | `/api/producto/search-by` | — (query) |
| GET | `/api/producto/marca/:id` | — |
| GET | `/api/producto/linea/:id` | — |
| GET | `/api/producto/:id` | — |
| PUT | `/api/producto/:id` | Ver ejemplo abajo |
| DELETE | `/api/producto/:id` | — (query: `usuarioId`) |
| GET | `/api/producto/:id/audit` | — |

**POST `/api/producto`** — `CreateProductoDto`:

```json
{
  "denominacion": "Producto X",      // string, REQUERIDO
  "observacion": "Opcional",         // string, opcional
  "codigoProveedor": "ABC-123",      // opcional
  "codigoBarra": "7790000000001",    // opcional
  "codigoReferencia": "REF1",        // opcional
  "ubicacion": "Estante 1",          // opcional
  "utilizaStockMinimo": true,        // boolean, REQUERIDO
  "stockMinimo": 10,                 // int, opcional
  "stock": 50,                       // int, opcional
  "costoEnDolar": false,             // boolean, opcional
  "destacado": false,                // boolean, opcional
  "envioGratis": false,              // boolean, opcional
  "costo": 100.5,                    // number, opcional
  "utilizaPack": false,              // boolean, REQUERIDO
  "cantidadPorPack": 0,              // int, opcional
  "costoDolar": 1.5,                 // number, opcional
  "lineaId": 1,                      // número, REQUERIDO
  "marcaId": 1,                      // número, REQUERIDO
  "porcentaje": 25,                  // number, opcional
  "precio": 250.75,                  // number, opcional
  "alicuotaIva": 21,                 // enum, REQUERIDO (0 | 10.5 | 21 | 27)
  "usuarioCreatedId": 1              // número, REQUERIDO
}
```

**PUT `/api/producto/:id`** — `UpdateProductoDto` (todos los de create opcionales):

```json
{
  "denominacion": "Producto X",
  "utilizaStockMinimo": true,
  "utilizaPack": false,
  "lineaId": 1,
  "marcaId": 1,
  "alicuotaIva": 21,
  "usuarioCreatedId": 1,
  "usuarioUpdatedId": 2              // número, REQUERIDO
}
```

> **Queries:**
> - `search-by` → `?denominacion=&codigoProveedor=&codProveedorExacto=&codigoReferencia=&marcaId=&lineaId=&proveedorId=&conStock=&skip=&take=`
> - `search-by-rapido` → `?codigo=&exacto=&skip=&take=`
> - `find-all-for-marcas/select` y `find-all-for-lineas/select` → `?denominacion=`
> - `DELETE` → `?usuarioId=` (requerido)

---

## LineaController — `/api/linea`
| Método | Ruta | Cuerpo (JSON) |
|---|---|---|
| POST | `/api/linea` | Ver ejemplo abajo |
| GET | `/api/linea/search-by` | — (query) |
| GET | `/api/linea/:id` | — |
| PUT | `/api/linea/:id` | Ver ejemplo abajo |
| DELETE | `/api/linea/:id` | — (query: `usuarioId`) |
| GET | `/api/linea/:id/audit` | — |

**POST `/api/linea`** — `CreateLineaDto`:

```json
{
  "denominacion": "Línea A",       // string, REQUERIDO
  "stockMinimo": 5,                // int, opcional
  "utilizaStockMinimo": true,      // boolean, REQUERIDO
  "observacion": "Opcional",       // string, opcional
  "usuarioCreatedId": 1            // número, REQUERIDO
}
```

**PUT `/api/linea/:id`** — `UpdateLineaDto`:

```json
{
  "denominacion": "Línea A",
  "utilizaStockMinimo": true,
  "usuarioCreatedId": 1,
  "usuarioUpdatedId": 2            // número, REQUERIDO
}
```

> **Queries:** `search-by` → `?denominacion=&skip=&take=&incluirEliminados=` | `DELETE` → `?usuarioId=` (requerido)

---

## ProveedorController — `/api/proveedor`
| Método | Ruta | Cuerpo (JSON) |
|---|---|---|
| POST | `/api/proveedor` | Ver ejemplo abajo |
| GET | `/api/proveedor/search-by` | — (query) |
| GET | `/api/proveedor/find-all-for-condiciones-iva/select` | — |
| GET | `/api/proveedor/find-all-for-localidades/select` | — |
| GET | `/api/proveedor/find-all-for-localidades-for/:id/select` | — |
| GET | `/api/proveedor/find-all-for-provincias/select` | — |
| GET | `/api/proveedor/condicion-iva/:id` | — |
| GET | `/api/proveedor/:id` | — (query: `empresaId`) |
| PUT | `/api/proveedor/:id` | Ver ejemplo abajo |
| DELETE | `/api/proveedor/:id` | — (query: `usuarioId`) |
| GET | `/api/proveedor/:id/audit` | — |

**POST `/api/proveedor`** — `CreateProveedorDto`:

```json
{
  "codigoProveedor": "PROV-01",          // opcional
  "denominacion": "Proveedor S.A.",      // string, REQUERIDO
  "denominacionAfip": "Opcional",        // opcional
  "cuit": "20-12345678-9",               // opcional
  "condicionIvaId": 1,                   // número, REQUERIDO (ID de condición de IVA)
  "domicilio": {                         // objeto, REQUERIDO
    "direccion": "Av. Siempre Viva 123", // string, REQUERIDO
    "localidadId": 1                     // número, REQUERIDO (ID de localidad)
  },
  "esProveedorMateriaPrima": true,       // boolean, REQUERIDO
  "esProveedorGastos": false,            // boolean, REQUERIDO
  "mail": "proveedor@mail.com",          // opcional
  "observacion": "Opcional",             // opcional
  "usuarioCreatedId": 1                  // número, REQUERIDO
}
```

**PUT `/api/proveedor/:id`** — `UpdateProveedorDto`:

```json
{
  "denominacion": "Proveedor S.A.",
  "condicionIvaId": 1,                   // número, REQUERIDO
  "domicilio": {                         // objeto, REQUERIDO
    "direccion": "Av. Siempre Viva 123", // opcional
    "localidadId": 1                     // opcional
  },
  "esProveedorMateriaPrima": true,
  "esProveedorGastos": false,
  "usuarioCreatedId": 1,
  "usuarioUpdatedId": 2                  // número, REQUERIDO
}
```

> **Queries:** `search-by` → `?empresaId=&denominacion=&condicionIvaId=&poseeSaldo=&skip=&take=&incluirEliminados=` | `GET /:id` → `?empresaId=` (requerido) | `DELETE` → `?usuarioId=` (requerido)

---

## CondicionIvaController — `/api/condicion-iva`
| Método | Ruta | Cuerpo (JSON) |
|---|---|---|
| POST | `/api/condicion-iva` | Ver ejemplo abajo |
| GET | `/api/condicion-iva/search-by` | — (query) |
| GET | `/api/condicion-iva/findAllFor` | — |
| GET | `/api/condicion-iva/:id` | — |
| PUT | `/api/condicion-iva/:id` | Ver ejemplo abajo |
| DELETE | `/api/condicion-iva/:id` | — |
| GET | `/api/condicion-iva/:id/audit` | — |

**POST `/api/condicion-iva`** — `CreateCondicionIvaDto`:

```json
{
  "denominacion": "Responsable Inscripto", // string, REQUERIDO
  "letra": "A",                            // string, opcional
  "observacion": "Opcional",               // opcional
  "usuarioCreatedId": 1                    // número, REQUERIDO
}
```

**PUT `/api/condicion-iva/:id`** — `UpdateCondicionIvaDto`:

```json
{
  "denominacion": "Responsable Inscripto",
  "letra": "A",
  "usuarioCreatedId": 1,
  "usuarioUpdatedId": 2                    // número, REQUERIDO
}
```

> **Queries:** `search-by` → `?denominacion=&skip=&take=`

---

## LocalidadController — `/api/localidad`
| Método | Ruta | Cuerpo (JSON) |
|---|---|---|
| POST | `/api/localidad` | Ver ejemplo abajo |
| GET | `/api/localidad/search-by` | — (query) |
| GET | `/api/localidad/:id` | — |
| PUT | `/api/localidad/:id` | Ver ejemplo abajo |
| DELETE | `/api/localidad/:id` | — |
| GET | `/api/localidad/find-all-for-provincias/select` | — |
| GET | `/api/localidad/:id/audit` | — |

**POST `/api/localidad`** — `CreateLocalidadDto`:

```json
{
  "denominacion": "Rosario",   // string, REQUERIDO
  "provinciaId": 1,            // número, REQUERIDO (ID de provincia)
  "observacion": "Opcional",   // opcional
  "usuarioCreatedId": 1        // número, REQUERIDO
}
```

**PUT `/api/localidad/:id`** — `UpdateLocalidadDto`:

```json
{
  "denominacion": "Rosario",
  "provinciaId": 1,
  "usuarioCreatedId": 1,
  "usuarioUpdatedId": 2        // número, REQUERIDO
}
```

> **Queries:** `search-by` → `?denominacion=&provinciaId=&skip=&take=&incluirEliminados=`

---

## ProvinciaController — `/api/provincia`
| Método | Ruta | Cuerpo (JSON) |
|---|---|---|
| POST | `/api/provincia` | Ver ejemplo abajo |
| GET | `/api/provincia` | — (query) |
| GET | `/api/provincia/search` | — (query) |
| GET | `/api/provincia/findAllFor` | — |
| GET | `/api/provincia/:id` | — |
| PUT | `/api/provincia/:id` | Ver ejemplo abajo |
| DELETE | `/api/provincia/:id` | — |

**POST `/api/provincia`** — `CreateProvinciaDto`:

```json
{
  "denominacion": "Santa Fe",  // string, REQUERIDO
  "observacion": "Opcional",   // opcional
  "usuarioCreatedId": 1        // número, REQUERIDO
}
```

**PUT `/api/provincia/:id`** — `UpdateProvinciaDto`:

```json
{
  "denominacion": "Santa Fe",
  "observacion": "Opcional",
  "usuarioCreatedId": 1
}
```

> **Nota:** `UpdateProvinciaDto` **no** tiene `usuarioUpdatedId`.
> **Queries:** `GET /provincia` y `/search` → `?denominacion=&skip=&take=`

---

## DomicilioController — `/api/domicilio`
| Método | Ruta | Cuerpo (JSON) |
|---|---|---|
| POST | `/api/domicilio` | Ver ejemplo abajo |
| GET | `/api/domicilio` | — |
| GET | `/api/domicilio/:id` | — |
| PATCH | `/api/domicilio/:id` | Ver ejemplo abajo |
| DELETE | `/api/domicilio/:id` | — |

**POST `/api/domicilio`** — `CreateDomicilioDto`:

```json
{
  "direccion": "Av. Siempre Viva 123", // string, REQUERIDO
  "localidadId": 1                     // número, REQUERIDO (ID de localidad)
}
```

**PATCH `/api/domicilio/:id`** — `UpdateDomicilioDto`:

```json
{
  "direccion": "Av. Siempre Viva 123", // opcional
  "localidadId": 1                     // opcional (ID de localidad)
}
```

---

## ClienteController — `/api/cliente`
| Método | Ruta | Cuerpo (JSON) |
|---|---|---|
| POST | `/api/cliente` | Ver ejemplo abajo |
| GET | `/api/cliente/search-by` | — (query) |
| GET | `/api/cliente/search-by-vendedor` | — (query) |
| GET | `/api/cliente/find-all-for-condiciones-iva/select` | — |
| GET | `/api/cliente/find-all-for-vendedores/select` | — (query) |
| GET | `/api/cliente/find-all-for-localidades/select` | — |
| GET | `/api/cliente/find-all-for-localidades-for/:id/select` | — |
| GET | `/api/cliente/find-all-for-provincias/select` | — |
| GET | `/api/cliente/condicion-iva/:id` | — |
| GET | `/api/cliente/:id` | — (query: `empresaId`) |
| PUT | `/api/cliente/:id` | Ver ejemplo abajo |
| DELETE | `/api/cliente/:id` | — (query: `usuarioId`) |
| GET | `/api/cliente/:id/audit` | — |

**POST `/api/cliente`** — `CreateClienteDto`:

```json
{
  "denominacion": "Cliente S.A.",        // string, REQUERIDO
  "denominacionAfip": "Opcional",        // opcional
  "codigo": "CLI-01",                    // opcional
  "cuit": "20-12345678-9",               // opcional
  "dni": "30.123.456",                   // opcional
  "condicionIvaId": 1,                   // número, REQUERIDO (ID de condición de IVA)
  "vendedorId": 2,                       // número, REQUERIDO (ID de personal/vendedor)
  "domicilio": {                         // objeto, REQUERIDO
    "direccion": "Av. Siempre Viva 123", // string, REQUERIDO
    "localidadId": 1                     // número, REQUERIDO (ID de localidad)
  },
  "mail": "cliente@mail.com",            // opcional
  "celular": "+54 341 5555555",          // opcional
  "contactoNombre": "Opcional",          // opcional
  "contactoCargo": "Opcional",           // opcional
  "observacion": "Opcional",             // opcional
  "usuarioCreatedId": 1                  // número, REQUERIDO
}
```

**PUT `/api/cliente/:id`** — `UpdateClienteDto`:

```json
{
  "denominacion": "Cliente S.A.",
  "condicionIvaId": 1,                   // número, REQUERIDO
  "vendedorId": 2,                       // número, REQUERIDO
  "domicilio": {                         // objeto, REQUERIDO
    "direccion": "Av. Siempre Viva 123", // opcional
    "localidadId": 1                     // opcional
  },
  "usuarioCreatedId": 1,
  "usuarioUpdatedId": 3                  // número, REQUERIDO
}
```

> **Queries:**
> - `search-by` → `?empresaId=&denominacion=&condicionIvaId=&poseeSaldo=&skip=&take=&incluirEliminados=`
> - `search-by-vendedor` → `?empresaId=&denominacion=&condicionIvaId=&skip=&take=`
> - `find-all-for-vendedores/select` → `?denominacion=`
> - `GET /:id` → `?empresaId=` (requerido)
> - `DELETE` → `?usuarioId=` (requerido)

---

## PersonalController — `/api/personal`
| Método | Ruta | Cuerpo (JSON) |
|---|---|---|
| POST | `/api/personal` | Ver ejemplo abajo |
| GET | `/api/personal/search-by` | — (query) |
| GET | `/api/personal/:id` | — |
| PUT | `/api/personal/:id` | Ver ejemplo abajo |
| DELETE | `/api/personal/:id` | — |
| GET | `/api/personal/:id/audit` | — |

**POST `/api/personal`** — `CreatePersonalDto`:

```json
{
  "denominacion": "Juan Perez",   // string, REQUERIDO
  "mail": "juan@mail.com",        // string, REQUERIDO
  "esVendedor": true,             // boolean, REQUERIDO
  "observacion": "Opcional",      // opcional
  "usuarioCreatedId": 1           // número, REQUERIDO
}
```

**PUT `/api/personal/:id`** — `UpdatePersonalDto`:

```json
{
  "denominacion": "Juan Perez",
  "mail": "juan@mail.com",
  "esVendedor": true,
  "usuarioCreatedId": 1,
  "usuarioUpdatedId": 2           // número, REQUERIDO
}
```

> **Queries:** `search-by` → `?denominacion=&skip=&take=&incluirEliminados=`

---

## EmpresaController — `/api/empresa`
| Método | Ruta | Cuerpo (JSON) |
|---|---|---|
| POST | `/api/empresa` | Ver ejemplo abajo |
| GET | `/api/empresa` | — (query) |
| GET | `/api/empresa/search` | — (query) |
| GET | `/api/empresa/:id` | — |
| PUT | `/api/empresa/:id` | Ver ejemplo abajo |
| DELETE | `/api/empresa/:id` | — |

**POST `/api/empresa`** — `CreateEmpresaDto`:

```json
{
  "denominacion": "Mi Empresa",      // string, REQUERIDO
  "cuit": "30-12345678-9",           // opcional
  "condicionIVAId": 1,               // número, REQUERIDO (ID de condición de IVA)
  "observacion": "Opcional",         // opcional
  "usuarioCreatedId": 1              // número, REQUERIDO
}
```

**PUT `/api/empresa/:id`** — `UpdateEmpresaDto` (todos opcionales, **no** tiene `usuarioUpdatedId`):

```json
{
  "denominacion": "Mi Empresa",
  "cuit": "30-12345678-9",
  "condicionIVAId": 1,
  "observacion": "Opcional",
  "usuarioCreatedId": 1
}
```

> **Nota:** el nombre del campo es **`condicionIVAId`** (con "IVA" en mayúsculas), distinto de `condicionIvaId` usado en cliente/proveedor.
> **Queries:** `GET /empresa` y `/search` → `?denominacion=&skip=&take=`

---

## AuthController — `/api/auth`
| Método | Ruta | Cuerpo (JSON) |
|---|---|---|
| POST | `/api/auth/registrar` | Ver ejemplo abajo |
| POST | `/api/auth/login` | Ver ejemplo abajo |
| POST | `/api/auth/login-con-google` | Ver ejemplo abajo |
| POST | `/api/auth/recuperar` | Ver ejemplo abajo |
| POST | `/api/auth/verificar-codigo` | Ver ejemplo abajo |
| PATCH | `/api/auth/cambiar-contrasena` | Ver ejemplo abajo |

**POST `/api/auth/registrar`** — `RegistrarUsuarioDto`:

```json
{
  "mail": "usuario@mail.com",   // string (email), REQUERIDO
  "contrasena": "claveSegura",  // string, REQUERIDO (mín. 8)
  "rolId": 1,                   // número, REQUERIDO
  "denominacion": "Juan Perez"  // string, REQUERIDO
}
```

**POST `/api/auth/login`** — `LoginDto`:

```json
{
  "mail": "usuario@mail.com",   // string, REQUERIDO
  "contrasena": "claveSegura",  // string, REQUERIDO (entre 8 y 20)
  "empresaId": 1                // número, REQUERIDO
}
```

**POST `/api/auth/login-con-google`** — body directo (no DTO):

```json
{
  "token": "google-oauth-token",  // string, REQUERIDO
  "empresaId": 1                  // número, REQUERIDO
}
```

**POST `/api/auth/recuperar`** — `RecuperarPasswordDto`:

```json
{
  "mail": "usuario@mail.com"   // string (email), REQUERIDO
}
```

**POST `/api/auth/verificar-codigo`** — `VerificarCodigoDto`:

```json
{
  "mail": "usuario@mail.com",  // string (email), REQUERIDO
  "codigo": "123456"           // string, REQUERIDO (exactamente 6 caracteres)
}
```

**PATCH `/api/auth/cambiar-contrasena`** — `CambiarContrasenaDto`:

```json
{
  "mail": "usuario@mail.com",   // string (email), REQUERIDO
  "nuevaContrasena": "claveNueva" // string, REQUERIDO (mín. 6)
}
```

---

## Seeds
| Método | Ruta | Cuerpo (JSON) |
|---|---|---|
| GET | `/api/seed-familia-producto/execute` | — |
| GET | `/api/seed-organizacion/execute` | — |
| GET | `/api/seed-all/execute` | — |
| GET | `/api/seed-usuario/execute` | — |

---

## FilesController — `/api/files`
| Método | Ruta | Cuerpo (JSON) |
|---|---|---|
| POST | `/api/files/producto` | `multipart/form-data` — campo `file` (archivo) |

---

## ProveedorOperacionController — `/api/proveedor-operacion`
| Método | Ruta | Cuerpo (JSON) |
|---|---|---|
| POST | `/api/proveedor-operacion` | `{}` (DTO vacío) |
| GET | `/api/proveedor-operacion` | — |
| GET | `/api/proveedor-operacion/:id` | — |
| PATCH | `/api/proveedor-operacion/:id` | `{}` (DTO vacío) |
| DELETE | `/api/proveedor-operacion/:id` | — |

> **Nota:** este controlador está sin implementar (DTO vacíos).

---

## ConfiguracionSistemaController — `/api/configuracion-sistema`
| Método | Ruta | Cuerpo (JSON) |
|---|---|---|
| GET | `/api/configuracion-sistema/:empresaId` | — |

---

## EmpresaOperacionController — `/api/empresa-operacion`
| Método | Ruta | Cuerpo (JSON) |
|---|---|---|
| POST | `/api/empresa-operacion` | `{}` (DTO vacío) |
| GET | `/api/empresa-operacion` | — |
| GET | `/api/empresa-operacion/:id` | — |
| PATCH | `/api/empresa-operacion/:id` | `{}` (DTO vacío) |
| DELETE | `/api/empresa-operacion/:id` | — |

> **Nota:** este controlador está sin implementar (DTO vacíos).

---

## ClienteOperacionController — `/api/cliente-operacion`
| Método | Ruta | Cuerpo (JSON) |
|---|---|---|
| POST | `/api/cliente-operacion` | `{}` (DTO vacío) |
| GET | `/api/cliente-operacion` | — |
| GET | `/api/cliente-operacion/:id` | — |
| PATCH | `/api/cliente-operacion/:id` | `{}` (DTO vacío) |
| DELETE | `/api/cliente-operacion/:id` | — |

> **Nota:** este controlador está sin implementar (DTO vacíos).

---

## ProductoOperacionController — `/api/producto-operacion`
| Método | Ruta | Cuerpo (JSON) |
|---|---|---|
| POST | `/api/producto-operacion` | `{}` (DTO vacío) |
| GET | `/api/producto-operacion` | — |
| GET | `/api/producto-operacion/:id` | — |
| PATCH | `/api/producto-operacion/:id` | `{}` (DTO vacío) |
| DELETE | `/api/producto-operacion/:id` | — |

> **Nota:** este controlador está sin implementar (DTO vacíos).

---

## BusquedasController — `/api/busquedas-genericas`
| Método | Ruta | Cuerpo (JSON) / Query |
|---|---|---|
| GET | `/api/busquedas-genericas/search-by` | — |

> **Queries:** `?tipoDocumento=&fechaDesde=&fechaHasta=&empresaId=&operadorId=&skip=&take=` (`fechaDesde`, `fechaHasta` y `tipoDocumento` requeridos; `fechaHasta` se transforma a fin de día).
