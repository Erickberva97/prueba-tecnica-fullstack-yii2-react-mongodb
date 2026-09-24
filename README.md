# Prueba Técnica Full Stack – Yii2 + React + MongoDB Erick Bermeo. 

## Descripción

La solución implementa un módulo de administración de solicitudes de soporte utilizando:

- Yii2 para el backend.
- React para el frontend.
- MongoDB como base de datos.
- API REST con intercambio de datos en JSON.

El módulo permite:

- Visualizar solicitudes registradas.
- Filtrar por estado y prioridad mediante consultas al backend.
- Crear nuevas solicitudes.
- Asignar automáticamente el usuario autenticado desde el backend.
- Cambiar el estado respetando las reglas de transición definidas.
- Consultar una solicitud por su identificador.
- Visualizar un resumen por estado.
- Manejar respuestas de validación y errores HTTP.

---

## Arquitectura

La solución se divide en tres responsabilidades principales:

```text
prueba-erick/
├── backend/
│   ├── commands/
│   │   └── MongoController.php
│   └── modules/
│       └── soporte/
│           ├── controllers/
│           │   └── SolicitudController.php
│           ├── models/
│           │   └── SolicitudSoporte.php
│           └── Module.php
│
├── frontend/
│   └── src/
│       ├── components/
│       │   ├── SolicitudForm.jsx
│       │   ├── SolicitudResumen.jsx
│       │   └── SolicitudTable.jsx
│       ├── pages/
│       │   └── Solicitudes.jsx
│       ├── services/
│       │   └── solicitudService.js
│       ├── App.jsx
│       └── App.css
│
└── README.md
```

### Backend

El backend está implementado como un módulo de Yii2 denominado `soporte`.

Responsabilidades:

- Validación de datos.
- Reglas de negocio.
- Autenticación en operaciones protegidas.
- Consultas a MongoDB.
- Conversión de tipos BSON para respuestas JSON.
- Manejo de códigos HTTP y excepciones.

### Frontend

El frontend está dividido en componentes y servicios.

Responsabilidades:

- Presentación de solicitudes.
- Filtros.
- Formulario de creación.
- Cambio de estado.
- Resumen de métricas.
- Manejo de errores retornados por la API.

### Persistencia

MongoDB almacena los documentos en la colección:

```text
solicitud_soporte
```

Estructura utilizada:

```json
{
  "_id": "ObjectId",
  "titulo": "string",
  "descripcion": "string",
  "prioridad": "BAJA | MEDIA | ALTA",
  "estado": "PENDIENTE | EN_PROCESO | FINALIZADA",
  "usuario_id": 100,
  "fecha_creacion": "UTCDateTime",
  "fecha_actualizacion": "UTCDateTime"
}
```

---

## Decisiones técnicas principales

### Validaciones en backend y frontend

React valida los campos obligatorios para mejorar la experiencia de uso, pero las validaciones definitivas se ejecutan en Yii2.

El backend valida:

- `titulo` obligatorio.
- `descripcion` obligatoria.
- `prioridad` obligatoria.
- `prioridad` limitada a `BAJA`, `MEDIA` o `ALTA`.
- `estado` limitado a los valores definidos.
- `usuario_id` como entero.
- Identificadores MongoDB con formato ObjectId válido.

La validación del frontend no reemplaza la validación del backend.

### Usuario autenticado

`usuario_id` no se acepta desde React.

Se asigna exclusivamente desde:

```php
Yii::$app->user->id
```

De esta forma, el cliente no puede definir la identidad del creador.

### Estado inicial

Al crear una solicitud, el backend asigna automáticamente:

```text
PENDIENTE
```

Aunque el cliente intente enviar otro estado, este no se utiliza para la creación.

### Fechas

Las fechas se generan en el backend utilizando `UTCDateTime`.

Esto evita depender de la fecha enviada por el cliente.

### Filtros

Los filtros se ejecutan directamente en MongoDB.

No se descarga toda la colección para filtrar en PHP o React.

Ejemplo:

```text
GET /api/solicitudes?estado=PENDIENTE&prioridad=ALTA
```

### Resumen

El resumen se obtiene mediante un pipeline de agregación de MongoDB.
No se recuperan todos los documentos para contarlos posteriormente en PHP.

### Índices

Se crean los siguientes índices:

```javascript
{ estado: 1, prioridad: 1 }
{ prioridad: 1 }
```

Justificación:

- El índice compuesto permite resolver consultas por `estado` y consultas combinadas por `estado + prioridad`.
- MongoDB puede utilizar el prefijo izquierdo del índice compuesto para consultas únicamente por `estado`.
- Se agrega un índice independiente sobre `prioridad` para las consultas donde únicamente se filtra por ese campo.
- No se agrega un índice independiente adicional sobre `estado` porque sería redundante para las consultas definidas.

### Reglas de transición

Las transiciones permitidas son:

```text
PENDIENTE -> EN_PROCESO
EN_PROCESO -> FINALIZADA
```

No se permite:

```text
PENDIENTE -> FINALIZADA
FINALIZADA -> PENDIENTE
```

Las reglas se validan en backend.

### ActiveRecord y acceso directo a colección

Se utiliza `yii\mongodb\ActiveRecord` para el manejo principal de solicitudes porque permite mantener atributos, reglas de validación y persistencia dentro del modelo.

Para el resumen se utiliza acceso directo a la colección y un pipeline de agregación, porque ese caso requiere una operación propia de MongoDB y no necesita instanciar documentos ActiveRecord.

---

## Requisitos

Entorno utilizado durante el desarrollo y validación:

```text
PHP            8.0.30
Composer       2.7.8
Yii2           2.0.55
yii2-mongodb   3.0.0
MongoDB        8.3.11
PHP MongoDB    1.20.1
Node.js        22.17.1
npm            10.9.2
React          Vite
```

También se requiere:

- MongoDB ejecutándose localmente.
- Extensión `mongodb` habilitada en PHP.
- Composer.
- Node.js y npm.

---

# Instalación

## 1. Clonar el repositorio

```bash
git clone <URL_DEL_REPOSITORIO>
cd prueba-erick
```

---

## 2. Backend

Ingresar al directorio:

```bash
cd backend
```

Instalar dependencias:

```bash
composer install
```

La conexión utilizada para MongoDB apunta a:

```text
mongodb://127.0.0.1:27017/soporte_db
```

La configuración se encuentra en:

```text
backend/config/mongodb.php
```

---

## 3. Crear colección y validaciones MongoDB

Desde la carpeta `backend` ejecutar:

```bash
php yii mongo/ping
```

Respuesta esperada:

```text
ok => 1
```

Crear la colección:

```bash
php yii mongo/init
```

Crear los índices:

```bash
php yii mongo/indexes
```

---

## 4. Ejecutar backend Yii2

Desde:

```text
backend/
```

ejecutar:

```bash
php yii serve --port=8080
```

La API quedará disponible en:

```text
http://localhost:8080
```

---

## 5. Frontend

Abrir otra terminal:

```bash
cd frontend
```

Instalar dependencias:

```bash
npm install
```

Ejecutar el servidor de desarrollo:

```bash
npm run dev
```

El frontend se ejecuta normalmente en:

```text
http://localhost:5173
```

Vite utiliza un proxy para redirigir:

```text
/api
```

hacia:

```text
http://localhost:8080
```

---

# Autenticación

Para las operaciones protegidas se utiliza autenticación Bearer.

Token utilizado para efectos de la prueba:

```text
100-token
```

Ejemplo:

```http
Authorization: Bearer 100-token
```

Las operaciones de creación y cambio de estado requieren autenticación.

---

# Endpoints

## Listar solicitudes

```http
GET /api/solicitudes
```

Filtros opcionales:

```http
GET /api/solicitudes?estado=PENDIENTE
GET /api/solicitudes?prioridad=ALTA
GET /api/solicitudes?estado=PENDIENTE&prioridad=ALTA
```

---

## Consultar una solicitud

```http
GET /api/solicitudes/{id}
```

Casos contemplados:

```text
200 Documento encontrado
400 ObjectId inválido
404 Documento inexistente
```

---

## Crear solicitud

```http
POST /api/solicitudes
```

Headers:

```http
Content-Type: application/json
Authorization: Bearer 100-token
```

Body:

```json
{
  "titulo": "Error al consultar cliente",
  "descripcion": "El servicio retorna error al consultar el cliente.",
  "prioridad": "MEDIA"
}
```

El backend asigna automáticamente:

```text
estado = PENDIENTE
usuario_id = usuario autenticado
fecha_creacion
fecha_actualizacion
```

Respuesta exitosa:

```text
HTTP 201
```

---

## Cambiar estado

```http
PUT /api/solicitudes/{id}/estado
```

Headers:

```http
Content-Type: application/json
Authorization: Bearer 100-token
```

Body:

```json
{
  "estado": "EN_PROCESO"
}
```

---

## Resumen

```http
GET /api/solicitudes/resumen
```

Respuesta:

```json
{
  "success": true,
  "data": {
    "total": 9,
    "pendientes": 4,
    "en_proceso": 1,
    "finalizadas": 4
  }
}
```

Los valores dependen del contenido actual de la colección.

---

# Códigos HTTP

La API utiliza códigos HTTP según el resultado de la operación.

| Código | Uso |
|---|---|
| 200 | Consulta o actualización correcta |
| 201 | Solicitud creada correctamente |
| 400 | Datos inválidos, ObjectId inválido o transición no permitida |
| 401 | Petición sin autenticación válida |
| 403 | Operación no autorizada cuando exista una regla de permisos aplicable |
| 404 | Documento no encontrado |
| 500 | Error interno o fallo de persistencia |

No se devuelve `HTTP 200` para representar operaciones que terminaron en error.

---

# Manejo de errores

Se contemplan los siguientes escenarios:

- Error de validación.
- HTTP 400.
- HTTP 401.
- HTTP 404.
- HTTP 500.
- API no disponible.
- Documento inexistente.
- Transición de estado no permitida.

`HTTP 403` se utiliza cuando exista una regla de autorización que lo requiera. El caso práctico no define roles adicionales para generar artificialmente este escenario.

El frontend muestra mensajes entendibles sin presentar stack traces al usuario.

---

# Pruebas con Postman

La API puede validarse utilizando la colección de Postman incluida con la entrega.

La colección contempla:

- Listado.
- Filtros válidos e inválidos.
- Creación correcta.
- Campos obligatorios.
- Prioridades inválidas.
- Autenticación faltante o inválida.
- Intento de manipulación de `usuario_id`.
- Intento de manipulación del estado inicial.
- Consulta por identificador.
- ObjectId inválido.
- Documento inexistente.
- Transiciones correctas.
- Transiciones no permitidas.
- Resumen por estado.

Orden recomendado:

```text
01 - Listado y filtros
02 - Creación
03 - Consulta por identificador
04 - Cambio de estado
05 - Resumen
06 - Escenarios manuales
```

---

# Validación realizada

## Frontend

```bash
npm run lint
npm run build
```

Resultado:

```text
Lint sin errores.
Build de producción generado correctamente.
```

## Backend

Se validó sintaxis PHP con:

```bash
php -l modules/soporte/models/SolicitudSoporte.php
php -l modules/soporte/controllers/SolicitudController.php
php -l modules/soporte/Module.php
php -l commands/MongoController.php
```

Resultado:

```text
No syntax errors detected
```

## MongoDB

Se validó:

```bash
php yii mongo/ping
php yii mongo/init
php yii mongo/indexes
```

Resultado:

```text
Conexión correcta.
Colección creada correctamente.
Índices creados correctamente.
```

---

# Preguntas técnicas

## 1. ActiveRecord vs consultas directas en MongoDB

ActiveRecord resulta conveniente cuando se trabaja con documentos que necesitan validaciones, atributos, reglas y operaciones CRUD asociadas a un modelo.

El acceso directo a la colección resulta más apropiado para operaciones específicas de MongoDB, como pipelines de agregación, métricas o consultas donde no es necesario crear instancias de ActiveRecord.

En esta solución:

- `SolicitudSoporte` utiliza ActiveRecord.
- El resumen utiliza directamente la colección y un pipeline de agregación.

---

## 2. ¿Por qué una validación en React no sustituye la validación del backend?

React se ejecuta en el cliente y puede ser modificado, omitido o reemplazado enviando peticiones directamente a la API.

Por esa razón, el backend debe validar siempre los datos antes de guardarlos.

La validación frontend mejora la experiencia de uso, mientras que la validación backend protege la integridad de la aplicación y de los datos.

---

## 3. Significado de los códigos HTTP

### 200 OK

La petición se procesó correctamente.

### 201 Created

Se creó correctamente un nuevo recurso.

### 400 Bad Request

La petición contiene datos inválidos o incumple una regla de negocio.

### 401 Unauthorized

La petición no contiene autenticación válida.

### 403 Forbidden

El usuario está autenticado, pero no tiene permiso para ejecutar la operación.

### 404 Not Found

El recurso solicitado no existe.

### 500 Internal Server Error

Ocurrió un error interno no atribuible a una petición válida del cliente.

---

## 4. ¿Para qué sirven los índices en MongoDB?

Los índices permiten reducir la cantidad de documentos que MongoDB necesita examinar al ejecutar consultas frecuentes.

Para `solicitud_soporte` se definieron:

```javascript
{ estado: 1, prioridad: 1 }
{ prioridad: 1 }
```

El índice compuesto cubre búsquedas por `estado` y búsquedas combinadas por `estado + prioridad`.

El índice independiente de `prioridad` permite optimizar consultas donde únicamente se filtra por prioridad.

---

## 5. Ventaja de utilizar un pipeline de agregación

Un pipeline permite que MongoDB realice los conteos directamente en el motor de base de datos.

Esto evita:

- Transferir todos los documentos hacia PHP.
- Consumir memoria innecesariamente.
- Recorrer toda la colección en la aplicación.
- Aumentar tráfico entre la aplicación y MongoDB.

La operación se ejecuta donde se encuentran los datos y únicamente se devuelve el resultado agregado.

---

# Análisis de código

Código analizado:

```php
public function actionCrear()
{
    $model = new SolicitudSoporte();
    $model->titulo = $_POST['titulo'];
    $model->descripcion = $_POST['descripcion'];
    $model->prioridad = $_POST['prioridad'];
    $model->usuario_id = $_POST['usuario_id'];
    $model->save();

    return [
        'success' => true
    ];
}
```

Problemas identificados:

### 1. Uso directo de `$_POST`

No utiliza los mecanismos de Yii2 para obtener el cuerpo de una petición JSON.

Debe utilizarse:

```php
Yii::$app->request->bodyParams
```

### 2. Confía en `usuario_id` enviado por el cliente

Permite que el cliente suplante la identidad de otro usuario.

Debe utilizarse:

```php
Yii::$app->user->id
```

### 3. No valida datos antes de guardar

No comprueba campos obligatorios ni valores permitidos.

El modelo debe ejecutar sus reglas de validación antes de persistir.

### 4. No asigna estado inicial

El estado inicial debe establecerse desde el backend:

```text
PENDIENTE
```

### 5. No genera fechas desde el backend

Deben asignarse `fecha_creacion` y `fecha_actualizacion`.

### 6. No verifica si `save()` fue exitoso

El método devuelve éxito incluso si MongoDB rechaza la operación.

Debe verificarse el resultado de persistencia.

### 7. No utiliza códigos HTTP adecuados

Una creación correcta debe devolver:

```text
HTTP 201
```

Los errores de validación deben devolver un código adecuado, por ejemplo:

```text
HTTP 400
```

### 8. No maneja excepciones de persistencia

Un fallo interno no debe presentarse como una operación exitosa.

### 9. Puede exponer comportamiento inconsistente

No existe una estructura clara de respuesta para validaciones, persistencia y errores.

Una implementación adecuada debe separar:

- Lectura del request.
- Validación.
- Reglas de negocio.
- Persistencia.
- Código HTTP.
- Formato de respuesta.

---

# Consideraciones de seguridad

- `usuario_id` se obtiene únicamente desde el backend.
- El estado inicial se controla desde el backend.
- Las fechas se generan en el backend.
- Las operaciones protegidas utilizan autenticación.
- Se validan los ObjectId recibidos.
- Las transiciones de estado se validan antes de persistir.
- No se filtran datos únicamente en React.
- No se realizan conteos cargando toda la colección.
- No se utiliza HTTP 200 para representar todos los errores.
- No se deben exponer stack traces ni información interna en respuestas de producción.

---

# Resultado funcional

La solución permite:

1. Visualizar solicitudes registradas.
2. Filtrar por prioridad y estado mediante consultas al backend.
3. Crear nuevas solicitudes.
4. Asignar automáticamente el usuario autenticado.
5. Cambiar el estado respetando las reglas definidas.
6. Consultar una solicitud por su identificador.
7. Visualizar el resumen de solicitudes por estado.
8. Manejar respuestas de error.
9. Mantener una estructura separada entre backend, acceso a datos y componentes React.

---

# Ejecución rápida

Terminal 1:

```bash
cd backend
php yii serve --port=8080
```

Terminal 2:

```bash
cd frontend
npm run dev
```

Aplicación:

```text
http://localhost:5173
```

API:

```text
http://localhost:8080



```
# 
By Erick Bermeo Valencia.