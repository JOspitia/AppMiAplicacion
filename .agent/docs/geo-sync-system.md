# Sistema de Sincronización Geográfica (Geo-Sync)

El sistema de **Geo-Sync** es un componente crítico del núcleo (Core) encargado de mantener un catálogo global estandarizado de ubicaciones, monedas y extensiones telefónicas, consumiendo datos de fuentes oficiales externas.

## 1. Arquitectura Técnica

### 1.1 Modelo de Datos (Esquema `configuration`)
El sistema gestiona una jerarquía de cuatro niveles:
- **Countries**: Nombre, código ISO2, extensión telefónica (`phone_code`) y estado de actividad.
- **States**: Vinculados a un país, con código regional.
- **Cities**: Vinculadas a un estado.
- **Currencies**: Código ISO, nombre, símbolo y símbolo nativo.

### 1.2 Servicio Core (`GeoSyncService.java`)
El servicio implementa una estrategia de **Sincronización Nuclear** para garantizar el rendimiento en entornos Cloud con latencia:

- **Optimización de Memoria (N+1 Fix)**: En lugar de realizar miles de consultas SQL, el servicio precarga TODO el catálogo actual en mapas de memoria (`Maps`) al inicio del proceso.
- **Procesamiento de Lotes**: Las inserciones se realizan utilizando `saveAll` para minimizar los viajes de ida y vuelta a la base de datos.
- **Mapeo Robusto de JSON**: Utiliza anotaciones `@JsonProperty` y `@JsonAlias` para asegurar la compatibilidad con diferentes formatos de nombres (snake_case vs camelCase) provenientes de la fuente externa (ej. `phone_code`).

## 2. Funcionalidades Clave

### 2.1 Sincronización de Extensiones Telefónicas
El sistema extrae automáticamente los indicativos internacionales (ej: `+57`, `+34`) y los vincula a cada país.
- **Normalización**: Se asegura de que todos los códigos comiencen con el prefijo `+` y no tengan espacios.
- **Persistencia**: Solo se actualizan los registros si la extensión ha cambiado o es nula, evitando escrituras innecesarias.

### 2.2 Gestión de Monedas
Sincroniza el catálogo de divisas globales para su uso en módulos financieros y de nómina. Incluye soporte para símbolos nativos para una mejor experiencia de usuario local.

### 2.3 Rendimiento y Estabilidad
- **Timeouts**: Gracias a la precarga en memoria, el proceso se ha reducido de ~150 segundos a <10 segundos para ~150,000 registros, evitando cortes de conexión de proxies como Cloudflare.
- **Aislamiento de Errores**: El proceso está envuelto en transacciones para asegurar la integridad de los datos; si un lote falla, el sistema loguea la advertencia pero continúa con el siguiente país.

## 3. Interfaz de Administración
Acceso desde: **Administración del Sistema** -> **Sincronización de Ubicaciones** (`/core/management/locations`). El módulo de gestión física se encuentra en `/rrhh/sedes`.

- **Estadísticas en Tiempo Real**: Visualización de conteos actuales de Países, Estados, Ciudades, Monedas y Extensiones.
- **Resultados de Sincronización**: Reporte detallado de cuántos registros fueron añadidos o actualizados al finalizar el proceso.

## 4. Fuente de Datos
Se utiliza el repositorio oficial de [dr5hn/countries-states-cities-database](https://github.com/dr5hn/countries-states-cities-database) en formato JSON para garantizar la precisión de los datos geográficos internacionales.
