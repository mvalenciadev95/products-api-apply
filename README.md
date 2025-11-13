# Products API - Apply Digital Challenge

## English

### What it does

The app has a cronjob that runs every hour and pulls products from Contentful. It stores them in MongoDB and exposes them through a REST API.

It has two main parts:

**Public side**: Anyone can query products here. They're paginated in groups of 5, and you can filter by name, category, price range, etc. You can also delete them (soft delete) and they stay deleted even if you restart the app.

**Private side**: Requires JWT authentication. This is where the reports are:
- Percentage of deleted vs non-deleted products
- Stats for non-deleted products (with or without price, by date range)
- A custom report I made: product distribution by category

### Stack I used

- Node.js 20 with NestJS
- MongoDB + Mongoose
- JWT for auth
- Swagger for docs (at `/api/docs`)
- Everything dockerized with Docker Compose

I also added:
- Tests with at least 30% coverage
- GitHub Actions for CI/CD
- Conventional commits

---

## How to run it

### What you need

- Docker and Docker Compose
- Node.js 20.x if you want to run it without Docker

### Environment variables

They're already configured in `docker-compose.yml`, but if you want to change them you can create a `.env`:

```
CONTENTFUL_SPACE_ID=9xs1613l9f7v
CONTENTFUL_ACCESS_TOKEN=I-ThsT55eE_B3sCUWEQyDT4VqVO3x__20ufuie9usns
CONTENTFUL_ENVIRONMENT=master
CONTENTFUL_CONTENT_TYPE=product
MONGODB_URI=mongodb://mongodb:27017/product-api-db
JWT_SECRET=df67f8636d95c1e73d596a83dd7c8b19
JWT_EXPIRES_IN=1h
PORT=4000
NODE_ENV=test
```

### With Docker (recommended)

The easiest way is to use Docker Compose:

```bash
docker-compose up -d
```

This spins up MongoDB and the API. The app runs at `http://localhost:4000` and Swagger docs are at `http://localhost:4000/api/docs`.

To bring everything down:

```bash
docker-compose down
```

If you want to delete the data too:

```bash
docker-compose down -v
```

### Without Docker

If you prefer to run it locally:

```bash
npm install
```

Make sure you have MongoDB running on port 27017 (or change the `MONGODB_URI`).

Then:

```bash
# Development
npm run start:dev

# Production
npm run build
npm run start:prod
```

---

## Syncing data from Contentful

The app syncs automatically every hour, but when you first start it you might want to do a manual sync.

### Manual sync

First you need a JWT token:

```bash
POST http://localhost:4000/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "admin"
}
```

**Note**: For this demo it accepts any user/pass combo. In production this would obviously need real user management.

Then use that token to trigger the sync:

```bash
POST http://localhost:4000/contentful/sync
Authorization: Bearer <your-token>
```

Or you can use Swagger at `http://localhost:4000/api/docs` which is more convenient. Click the "Authorize" button, paste your token and you can test all endpoints from there.

---

## Endpoints

### Public

- `GET /products` - List paginated products with optional filters
- `DELETE /products/:id` - Delete a product (soft delete)

### Private (require JWT)

- `POST /auth/login` - Login to get a token
- `POST /contentful/sync` - Force sync with Contentful
- `GET /reports/deleted-percentage` - Percentage of deleted products
- `GET /reports/non-deleted-stats` - Stats for active products
- `GET /reports/category-distribution` - Distribution by category

All the details are in Swagger: `http://localhost:4000/api/docs`

---

## Tests

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Coverage
npm run test:cov
```

Tests run automatically on GitHub Actions with every push.

---

## Technical decisions

### Why MongoDB

Seemed like the best option because it gave me flexibility to store the raw Contentful data while keeping a clean schema for the important fields. I implemented soft delete with a `deletedAt` field.

### Pagination

I paginated in groups of 5 as requested using skip/limit. For large datasets in production I'd use cursor-based pagination which scales better.

### The cronjob

I used NestJS's Schedule module with cron. It runs every hour and logs what happens. If it fails it doesn't crash the app, just logs a warning.

### Authentication

For the demo any user/pass works. In a real project I'd implement password hashing, user registration, roles, etc.

### Contentful

Right now it fetches up to 1000 products per sync. If there were more I'd need to implement pagination in the Contentful API calls, but for the normal use case it works fine.

### Custom report

I made one for category distribution that I thought would be useful to see how the catalog is structured.

### Error handling

I use NestJS's exception filters and validation pipes to have consistent error responses. All endpoints return appropriate status codes.

---

## Structure

```
src/
├── auth/              # Authentication module
├── config/            # Config files
├── contentful/        # Contentful integration and scheduler
├── products/          # Products module (public endpoints)
├── reports/           # Reports module (private endpoints)
└── main.ts            # Entry point
```

---

## Español

### Lo que hace

La app tiene un cronjob que corre cada hora y trae los productos desde Contentful. Los guarda en MongoDB y los expone a través de una REST API.

Tiene dos partes principales:

**Parte pública**: Acá cualquiera puede consultar los productos. Están paginados de a 5, se pueden filtrar por nombre, categoría, rango de precios, etc. También se pueden borrar (soft delete) y quedan borrados incluso si reinicias la app.

**Parte privada**: Requiere autenticación con JWT. Acá están los reportes:
- Porcentaje de productos borrados vs no borrados
- Stats de productos no borrados (con o sin precio, por rango de fechas)
- Un reporte custom que armé: distribución de productos por categoría

### Stack que usé

- Node.js 20 con NestJS
- MongoDB + Mongoose
- JWT para auth
- Swagger para docs (en `/api/docs`)
- Todo dockerizado con Docker Compose

También agregué:
- Tests con al menos 30% de coverage
- GitHub Actions para CI/CD
- Conventional commits

---

## Cómo correrlo

### Lo que necesitás

- Docker y Docker Compose
- Node.js 20.x si lo querés correr sin Docker

### Variables de entorno

Ya están configuradas en el `docker-compose.yml`, pero si querés cambiarlas podés crear un `.env`:

```
CONTENTFUL_SPACE_ID=9xs1613l9f7v
CONTENTFUL_ACCESS_TOKEN=I-ThsT55eE_B3sCUWEQyDT4VqVO3x__20ufuie9usns
CONTENTFUL_ENVIRONMENT=master
CONTENTFUL_CONTENT_TYPE=product
MONGODB_URI=mongodb://mongodb:27017/product-api-db
JWT_SECRET=df67f8636d95c1e73d596a83dd7c8b19
JWT_EXPIRES_IN=1h
PORT=4000
NODE_ENV=test
```

### Con Docker (recomendado)

Lo más fácil es usar Docker Compose:

```bash
docker-compose up -d
```

Esto levanta MongoDB y la API. La app queda corriendo en `http://localhost:4000` y la doc de Swagger en `http://localhost:4000/api/docs`.

Para bajar todo:

```bash
docker-compose down
```

Si querés borrar también los datos:

```bash
docker-compose down -v
```

### Sin Docker

Si preferís correrlo local:

```bash
npm install
```

Asegurate de tener MongoDB corriendo en el puerto 27017 (o cambiá el `MONGODB_URI`).

Después:

```bash
# Desarrollo
npm run start:dev

# Producción
npm run build
npm run start:prod
```

---

## Sincronizar datos de Contentful

La app sincroniza automáticamente cada hora, pero cuando la levantás por primera vez puede que quieras hacer una sync manual.

### Sincronización manual

Primero necesitás un token JWT:

```bash
POST http://localhost:4000/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "admin"
}
```

**Nota**: Para este demo acepta cualquier user/pass. En producción esto tendría que ser con usuarios reales obvio.

Después usás ese token para hacer la sync:

```bash
POST http://localhost:4000/contentful/sync
Authorization: Bearer <tu-token>
```

O podés usar Swagger en `http://localhost:4000/api/docs` que es más cómodo. Le das al botón "Authorize", pegás el token y podés probar todos los endpoints desde ahí.

---

## Endpoints

### Públicos

- `GET /products` - Lista productos paginados con filtros opcionales
- `DELETE /products/:id` - Borra un producto (soft delete)

### Privados (requieren JWT)

- `POST /auth/login` - Login para obtener token
- `POST /contentful/sync` - Forzar sincronización con Contentful
- `GET /reports/deleted-percentage` - Porcentaje de productos borrados
- `GET /reports/non-deleted-stats` - Stats de productos activos
- `GET /reports/category-distribution` - Distribución por categoría

Todos los detalles están en Swagger: `http://localhost:4000/api/docs`

---

## Tests

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Coverage
npm run test:cov
```

Los tests corren automáticamente en GitHub Actions con cada push.

---

## Decisiones técnicas

### Por qué MongoDB

Me pareció la mejor opción porque me daba flexibilidad para guardar la data cruda de Contentful mientras mantenía un schema limpio para los campos importantes. El soft delete lo implementé con un campo `deletedAt`.

### Paginación

Paginé de a 5 como pedían usando skip/limit. Para datasets grandes en producción usaría cursor-based pagination que escala mejor.

### El cronjob

Usé el módulo de Schedule de NestJS con cron. Corre cada hora y loguea lo que pasa. Si falla no tira abajo la app, solo loguea el warning.

### Autenticación

Para el demo cualquier user/pass funciona. En un proyecto real implementaría password hashing, registro de usuarios, roles, etc.

### Contentful

Por ahora trae hasta 1000 productos por sync. Si hubiera más habría que implementar paginación en las llamadas a Contentful, pero para el caso de uso normal funciona bien.

### Reporte custom

Hice uno de distribución por categorías que me pareció útil para ver cómo está estructurado el catálogo.

### Manejo de errores

Uso los exception filters y validation pipes de NestJS para tener respuestas de error consistentes. Todos los endpoints devuelven los status codes apropiados.

---

## Estructura

```
src/
├── auth/              # Módulo de autenticación
├── config/            # Configs
├── contentful/        # Integración con Contentful y scheduler
├── products/          # Módulo de productos (endpoints públicos)
├── reports/           # Módulo de reportes (endpoints privados)
└── main.ts            # Entry point
```

---

## Licencia

Proyecto desarrollado como parte de una evaluación técnica para Apply Digital.