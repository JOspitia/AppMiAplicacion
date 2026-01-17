---
description: Documentación completa de la implementación del módulo de Gestión de Horarios Laborales (Work Schedules System).
---

# Gestión de Horarios Laborales

Este flujo de trabajo describe la implementación del módulo de Horarios Laborales, que permite configurar turnos de trabajo, ciclos y jornadas semanales o rotativas.

## 1. Arquitectura de Datos (Backend)

### 1.1 Modelo `WorkSchedule`
Entidad principal que define un horario laboral con su configuración.
- **Tabla**: `business_rrhh.work_schedules`
- **Campos Principales**:
    - `id` (UUID): Identificador único.
    - `name` (String): Nombre descriptivo del horario.
    - `description` (String): Detalles del horario.
    - `scheduleType` (String): Tipo de horario (`WEEKLY`, `CYCLICAL`).
    - `cycleLengthDays` (Integer): Duración del ciclo en días (para horarios cíclicos).
    - `toleranceMinutes` (Integer): Minutos de tolerancia para llegadas tarde.
    - `color` (String): Color hex para visualización en calendarios.
    - `maxWeeklyHours` (Integer): Límite máximo de horas semanales.
    - `totalWeeklyHours` (Double): Total calculado automáticamente.
    - `active` (Boolean): Estado del horario.

### 1.2 Modelo `WorkScheduleDay`
Entidad que define cada día dentro del horario.
- **Tabla**: `business_rrhh.work_schedule_days`
- **Campos Principales**:
    - `dayNumber` (Integer): Número del día (1-7 para semanal, 1-N para cíclico).
    - `isRestDay` (Boolean): Marca si es día de descanso.
    - `startTime` (LocalTime): Hora de inicio de la jornada.
    - `endTime` (LocalTime): Hora de fin de la jornada.
    - `isNextDay` (Boolean): Indica si termina al día siguiente (turnos nocturnos).
    - `breakMinutes` (Integer): Minutos de descanso no remunerado.

### 1.3 Reglas de Negocio (Service)
- **Cálculo Automático de Horas**: El servicio calcula automáticamente `totalWeeklyHours` considerando:
    - Para WEEKLY: Suma directa de horas de cada día.
    - Para CYCLICAL: Normaliza a promedio semanal `(totalHorasCiclo / díasCiclo) × 7`.
    - Resta los minutos de descanso de cada día.
    - Maneja correctamente turnos nocturnos que cruzan medianoche.
- **Validación de Unicidad**: Nombre único por compañía.
- **Gestión Bidireccional**: Al guardar, asegura que la relación `days ↔ schedule` sea consistente.

## 2. Interfaz de Usuario (Frontend)

### 2.1 Work Schedule List (`work-schedule-list.component`)
Implementa el estándar de diseño **Premium Glassmorphism** con listado optimizado.
- **Visualización (Patrón Columna Combinada)**:
    - **Horario**: Columna combinada con icono `clock` en color personalizado (del campo `color`), nombre y descripción con tooltip.
    - **Tipo**: Badge que muestra "Semanal" o "Cíclico (Nd)" según configuración.
    - **Horas/Sem**: Muestra `totalWeeklyHours` con formato decimal y el máximo configurado.
    - **Tolerancia**: Minutos de gracia permitidos.
    - **Gestión**: Botones de acción para Editar y Activar/Desactivar con tooltips.

### 2.2 Work Schedule Form (`work-schedule-form.component`)
Formulario dinámico con **Grid Adaptativo** según tipo de horario.

#### Características Principales:
1. **Hero Header**: Siguiendo el estándar de formularios con título gradiente y botón de retorno premium.
2. **Sección de Información General**:
    - **Nombre del horario**: Input con icono `clock`.
    - **Tipo de horario**: Dropdown (Semanal/Cíclico).
    - **Días del ciclo**: Input numérico (solo para Cíclico).
    - **Tolerancia**: Minutos de gracia.
    - **Máximo de horas semanales**: Define el límite permitido para validar la configuración.
    - **Color Identificador**:
        - Input Hexadecimal para precisión (`#RRGGBB`).
        - **Recuadro de Color Interactivo**: Al hacer clic, despliega un selector de color (ColorPicker) superpuesto invisiblemente para una experiencia fluida.
        - Sincronización en tiempo real entre input y selector.
    - **Descripción**: Textarea opcional.

3. **Sección de Grid Dinámico**:
    - Reconstrucción automática al cambiar tipo de horario o longitud del ciclo.
    - **WEEKLY**: 7 filas con nombres de días (Lunes-Domingo).
    - **CYCLICAL**: N filas con etiquetas numéricas (Día 1...N).
    
4. **Columnas del Grid**:
    - **Día**: Etiqueta estática. Si es día de descanso, el texto se atenúa.
    - **Hora Inicio/Fin**: Inputs de hora. Se **inhabilitan** automáticamente si es día de descanso.
    - **Descanso (min)**: Minutos de break no remunerado.
    - **Turno Nocturno**: Toggle para jornadas que cruzan medianoche (añade 24h al cálculo).
    - **Descanso**: Toggle principal. Al activarlo, bloquea todos los inputs de la fila y excluye el día del cálculo de horas.

5. **Cálculo y Validación en Tiempo Real**:
    - **Reactividad Total**: El sistema se suscribe a `valueChanges` del formulario para recalcular instantáneamente al modificar cualquier dato.
    - **Caja de Total de Horas Inteligente**:
        - **Estado Correcto (Verde/Emerald)**: Si el total es menor o igual al máximo permitido. Muestra icono de verificación.
        - **Estado de Alerta (Rojo/Rose)**: Si se supera el límite. Muestra icono de alerta y mensaje de error explícito.
    - **Bloqueo de Guardado**: El botón "Crear/Actualizar" se deshabilita automáticamente si las horas exceden el límite, previniendo configuraciones inválidas.

6. **Motor de Cálculo "Golden Standard" (Sincronización Total)**:
    - **Fórmula Unificada (FE/BE)**: Para evitar discrepancias y valores negativos, tanto el frontend (TS) como el backend (Java) utilizan aritmética modular de 24 horas (1440 minutos).
      $$Duración = (MinutosFin - MinutosInicio + 1440) \pmod{1440}$$
    - **Auto-Amanecida (Smart Detector)**: El conjunto FE/BE detecta automáticamente si la `HoraFin` es menor que la `HoraInicio` (ej: 10:00 PM a 06:00 AM).
        - Frontend activa visualmente el flag `isNextDay`.
        - Backend (`calculateDuration`) compensa la diferencia sumando 1440 minutos si el resultado es negativo, asegurando duraciones siempre positivas.
    - **Protección de Negativos**: Uso de `Math.max(0, ...)` en ambos lados para asegurar que el total semanal nunca sea menor a cero ante errores de configuración masivos.
    - **Estabilidad de Tema (Anti-Flash)**: Uso de `transition-colors duration-300` en todas las celdas del grid para evitar parpadeos visuales al cambiar entre modo oscuro/claro.
    
7. **Lógica de validación**:
    - El guardado se bloquea si las horas totales superan el límite semanal configurado.
    - Las horas se redondean a 1 decimal para precisión administrativa.

## 3. Integración y Servicios
- **WorkScheduleService**: Maneja el CRUD completo del horario con sus días anidados.
- **Endpoints**: `/api/rrhh/work-schedules` (CRUD completo + toggle active).

## 4. Estándares Técnicos Aplicados

### 4.1 Backend
- **DTOs Anidados**: `WorkScheduleDto` contiene `List<WorkScheduleDayDto>` para transferir toda la estructura en una sola llamada.
- **Orphan Removal**: Usar `orphanRemoval = true` en la relación `@OneToMany` asegura que los días huérfanos se eliminen automáticamente.
- **Validaciones de Multi-tenencia**: Todos los métodos validan que el usuario tenga acceso a la compañía.

### 4.2 Frontend
- **Reactive Forms + FormArray**: El `daysArray` es dinámico y se reconstruye con `initializeDays()` al cambiar configuración.
- **Diseño Premium**: Siguiendo workflows `/ui-consistency-forms.md` y `/ui-consistency-standards.md`:
    - Hero Header con gradiente.
    - Contenedor Glassmorphism con `backdrop-blur-3xl`.
    - Grid con diseño de tabla moderno (bordes sutiles, backgrounds diferenciados).
    - Inputs con padding consistente, focus rings en color primario.
- **Computed Signals**: Para cálculos reactivos sin ejecutar lógica en el template.

## 5. Casos de Uso Típicos

### Ejemplo 1: Horario Semanal Estándar (Lun-Vie, 8h/día)
- `scheduleType`: WEEKLY
- Días 1-5: `startTime: 08:00, endTime: 17:00, breakMinutes: 60` → 8h/día × 5 = **40h totales**.
- Días 6-7: `isRestDay: true`.

### Ejemplo 2: Turno Nocturno (22:00 - 06:00)
- `startTime: 22:00, endTime: 06:00, isNextDay: true, breakMinutes: 30`.
- Cálculo: `(6:00 + 24h) - 22:00 - 0.5h = 7.5 horas`.

### Ejemplo 3: Rotación Quincenal (14 días)
- `scheduleType`: CYCLICAL, `cycleLengthDays: 14`.
- Configurar días 1-14 con diferentes turnos.
- El total se normaliza: `(suma horas 14 días / 14) × 7 = promedio semanal`.

## 6. Arquitectura Global-Ready (Enterprise Features)

### 6.1 Campos para Internacionalización
El módulo ahora incluye campos que permiten su uso en cualquier país sin modificar código:

#### `referenceDate` (LocalDate)
- **Propósito**: Define el punto de inicio para horarios cíclicos.
- **Uso**: En un horario 4x2 (4 días trabajo, 2 descanso), el sistema necesita saber cuándo empezó el "Día 1" para calcular correctamente qué día del ciclo le corresponde a un empleado en una fecha específica.
- **Ejemplo**: Si `referenceDate = 2026-01-06` (lunes) y `cycleLengthDays = 6`, entonces:
  - 2026-01-06 → Día 1
  - 2026-01-07 → Día 2
  - ...
  - 2026-01-12 → Día 1 (reinicia el ciclo)

#### `firstDayOfWeek` (Integer, 1-7)
- **Propósito**: Adaptación cultural del inicio de semana.
- **Valores**: 1=Lunes (ISO 8601, Europa/Latam), 7=Domingo (EE.UU.), 6=Sábado (países árabes).
- **Impacto**: Afecta la visualización del grid semanal y los reportes de asistencia.

### 6.2 Mejoras de UX Implementadas

#### Botón "Aplicar a Todos los Días" ✅
- **Ubicación**: Encima del grid de configuración semanal.
- **Función**: Copia la configuración del primer día (horarios, descansos, turno nocturno) a todos los demás días del horario.
- **Beneficio**: Reduce de 7 pasos a 1 la configuración de horarios uniformes (ej: Lun-Vie 8:00-17:00).
- **Implementación**: Método `applyToAllDays()` que itera sobre el `FormArray` y aplica `patchValue()`.

#### Visualizador de Ciclo (Timeline) ✅
- **Ubicación**: Aparece automáticamente debajo de la descripción cuando se selecciona tipo "Cíclico".
- **Características**:
  - **Bloques Visuales**: Cada día del ciclo se muestra como una tarjeta con:
    - Número de día (Día 1, Día 2, etc.)
    - Icono diferenciado (💼 trabajo vs 🌙 descanso)
    - Horas calculadas en tiempo real para días laborales
    - Colores dinámicos (gradiente primario para trabajo, gris para descanso)
  - **Efectos Premium**:
    - Animación de shimmer en hover sobre días laborales
    - Escala suave al pasar el mouse
    - Scroll horizontal con scrollbar personalizada
  - **Leyenda Informativa**: Muestra el significado de colores y el total de días del ciclo
- **Beneficio**: El usuario visualiza instantáneamente el patrón de rotación (ej: 4x2, 6x1) antes de guardar.

#### Validación de Solapamiento (Futuro)
- Detectará si un empleado tiene menos de X horas de descanso entre jornadas.
- Mostrará advertencia (no bloqueante) para cumplir con estándares de salud laboral.

### 6.3 Funcionalidades Avanzadas Implementadas

#### Fase 2: Visualizador de Ciclo (Timeline) ✅
- **Implementado**: 2026-01-17
- Componente visual interactivo que muestra la secuencia de días de trabajo y descanso.

#### Fase 3: Jornada Partida (Multiple TimeSlots) ✅
- **Implementado**: 2026-01-17 (Refinado UI/BE: 2026-01-17)
- **Descripción**: Permite configurar múltiples bloques de tiempo para un solo día (ej: Mañana y Tarde) con una interfaz de tabla de alta precisión.
- **Backend Técnico**: 
  - Nueva entidad `WorkScheduleTimeSlot` (Tabla `business_rrhh.work_schedule_time_slots`).
  - **Sincronización de Motor**: El servidor ahora procesa recursivamente los slots y aplica la misma lógica modular que el frontend para el cálculo del total semanal.
- **Frontend Interfaz Premium (Grid Maestro)**:
  - **Alineación de Columnas de Precisión**: Cada fila de turno (slot) utiliza un grid `[1fr, 1fr, 1fr, 100px, 120px]` que se alinea milimétricamente con los títulos de la cabecera.
  - **Ajuste de Altura (Full-Stretch)**: Uso de `items-stretch` y `h-full` para que todas las celdas cubran el 100% de la altura de la fila, garantizando consistencia visual.
  - **Marcadores de Turno (#1, #2...)**: Posicionados de forma absoluta para no romper el centrado de los selectores de hora.
  - **Acciones Visuales**: Botón de borrado "X" en color `rose-500` brillante (22px) para máxima claridad.
  - **Diseño Glass-Table**: Fondo dinámico `bg-white/40` con bordes sutiles que respetan el sistema de diseño Core.
- **Beneficio**: Soporte profesional para horarios de retail y gastronomía con pausas de larga duración, sin sacrificar la limpieza visual del grid general.

## 7. Workflows Relacionados
- Este módulo es dependencia para **Contratos de Empleados**, donde se asignará el horario laboral a cada contrato.
- Integración futura con **Asistencia y Nómina** para cálculo de horas extras.
