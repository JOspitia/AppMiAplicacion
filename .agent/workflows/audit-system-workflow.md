---
description: Workflow para la implementación y uso del Sistema de Auditoría Automática (JPA Auditing)
---

# Sistema de Auditoría Automática (JPA Auditing)

Este workflow detalla cómo funciona el sistema de auditoría automática implementado en el backend, cómo aplicarlo a nuevas entidades y qué consideraciones técnicas se deben tener en cuenta.

## 1. Arquitectura del Sistema

El sistema utiliza **Spring Data JPA Auditing** para capturar los metadatos de creación y modificación sin intervención manual en el código de negocio (servicios).

### Componentes Core:
- **`AuditableEntity`**: Clase base (`@MappedSuperclass`) que define los 4 campos estándar: `createdAt`, `updatedAt`, `createdBy`, `updatedBy`.
- **`SpringSecurityAuditorAware`**: Componente que extrae el objeto `User` actual del `SecurityContextHolder`. **Crítico**: Debe consultar el repositorio (`userRepository.findById`) para devolver una entidad gestionada por Hibernate, de lo contrario los campos de auditoría podrían quedar nulos.
- **`JpaAuditingConfig` (o `BackendApiApplication`)**: Habilita la auditoría mediante `@EnableJpaAuditing(auditorAwareRef = "springSecurityAuditorAware")`.

## 2. Cómo Implementar en Nuevas Entidades

Para que una nueva tabla/entidad tenga auditoría automática, siga estos pasos:

### Paso 1: Asegurar Columnas en Base de Datos
La tabla debe tener las columnas correspondientes en su migración SQL:
```sql
ALTER TABLE esquema.tabla ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE esquema.tabla ADD COLUMN updated_at TIMESTAMP;
ALTER TABLE esquema.tabla ADD COLUMN created_by UUID REFERENCES security.users(id);
ALTER TABLE esquema.tabla ADD COLUMN updated_by UUID REFERENCES security.users(id);
```

### Paso 2: Extender de `AuditableEntity`
En la clase Java de la entidad, herede de la clase base:
```java
@Entity
public class MiNuevaEntidad extends AuditableEntity {
    // Sus campos específicos de negocio...
}
```

Ya **no es necesario** asignar manualmente las fechas o el usuario en los métodos `create` o `update`. Spring lo hará automáticamente al ejecutar el `repository.save()`.

### Paso 4: Configuración de Zona Horaria (Docker)
Para que las fechas coincidan con la hora local (ej. Colombia), asegúrese de:
1.  **Docker**: Setear `TZ=America/Bogota` en las variables de entorno de los servicios `backend` y `postgres` en `docker-compose.yml`.
2.  **Java**: Configurar el default en el `@PostConstruct` de la aplicación principal:
    ```java
    TimeZone.setDefault(TimeZone.getTimeZone("America/Bogota"));
    ```

## 3. Qué tener en cuenta (Reglas de Oro)

1. **Opcionalidad**: Si una entidad NO extiende de `AuditableEntity`, el sistema la ignora por completo. Esto evita errores en tablas que no requieren auditoría.
2. **Contexto de Seguridad**: La auditoría de `createdBy`/`updatedBy` requiere que haya un usuario autenticado. Si se ejecutan procesos en segundo plano (Batch/Async) sin contexto de usuario, estos campos quedarán nulos.
3. **No tocar DTOs**: Generalmente, los campos de auditoría son de solo lectura para el cliente. No se deben incluir en los DTOs de "Creación" o "Actualización", solo en los DTOs de "Respuesta" si es necesario mostrarlos en el UI.
4. **Impacto en Lints/Lombok**: Al heredar de una clase con campos @Data o @Getter/@Setter, utilice `@EqualsAndHashCode(callSuper = true)` y `@ToString(callSuper = true)` si es necesario.

## 4. Troubleshooting (Fallas Comunes)

| Problema | Causa Posible | Solución |
| :--- | :--- | :--- |
| **Campos NULL en `updated_at`** | No hubo cambios reales en los datos. | Hibernate no ejecuta UPDATE si los datos enviados son idénticos a los de la BD ("Dirty Checking"). |
| **Campos NULL en `created_by`** | Usuario no gestionado (Detached). | El `AuditorAware` debe usar `userRepository.findById()` para asegurar que la entidad esté en el contexto de persistencia. |
| **No se dispara la auditoría** | Herencia de Listeners fallida. | Agregue `@EntityListeners(AuditingEntityListener.class)` explícitamente en la clase de la entidad (ej. `Department`). |
| **Hora incorrecta (+5h)** | Zona horaria en UTC. | Verifique la variable `TZ` en Docker y el `TimeZone.setDefault` en Java. |

## 5. Mejoras Futuras Sugeridas

- **Soft Delete Global**: Implementar una clase base similar para `deleted_at` y `deleted_by` que automáticamente filtre registros borrados usando `@Where(clause = "deleted_at IS NULL")`.
- **Revisiones (Envers)**: Si se requiere un historial de TODOS los cambios (no solo el último), se puede integrar **Hibernate Envers** para crear tablas `_AUD` con el versionamiento completo de cada campo.
- **Frontend Audit UI**: Crear un componente decorador en Angular que muestre un pequeño "badge" en los formularios con: *"Creado por [User] el [Fecha] | Editado por..."*.
- **Auditoría de IPs**: Agregar el campo `remote_ip` a la clase base para rastrear desde dónde se realizó el cambio.

---
// turbo-all
