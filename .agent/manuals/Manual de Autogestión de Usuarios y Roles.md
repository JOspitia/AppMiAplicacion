# Manual de Autogestión de Usuarios y Roles

## 🎯 Introducción

Este manual le permitirá gestionar su equipo de forma completamente autónoma: crear usuarios, asignar permisos, configurar roles personalizados y mantener la seguridad de su organización sin depender de soporte técnico.

**¿Para quién es este manual?**
- Administradores de Empresa
- Gerentes de RRHH
- Coordinadores de TI
- Cualquier usuario con permisos de gestión de personal

---

## 📋 Índice

1. [Conceptos Fundamentales](#conceptos)
2. [Gestión de Roles](#roles)
3. [Gestión de Usuarios](#usuarios)
4. [Seguridad y Contraseñas](#seguridad)
5. [Casos de Uso Prácticos](#casos)
6. [Solución de Problemas](#problemas)

---

## <a name="conceptos"></a>1. Conceptos Fundamentales

### ¿Qué es un Usuario?

Un **usuario** es una persona de su organización con acceso a la plataforma. Cada usuario tiene:

- 🆔 **Identificación única** (username + email)
- 🔑 **Credenciales de acceso** (contraseña encriptada)
- 👤 **Perfil personal** (nombre, cargo, departamento)
- 🎭 **Uno o más roles** que definen sus permisos

---

### ¿Qué es un Rol?

Un **rol** es una plantilla de permisos que define QUÉ puede hacer un usuario en el sistema.

**Analogía del mundo real:**

Imagine que su empresa es un hotel:
- El **Gerente General** tiene llaves de todas las habitaciones y áreas
- El **Recepcionista** solo tiene llaves de la recepción y el lobby
- El **Personal de Limpieza** tiene llaves de las habitaciones pero no de la caja fuerte

En la plataforma:
- El **Gerente General** = Rol con todos los permisos
- El **Recepcionista** = Rol con permisos limitados (ver, registrar)
- El **Personal de Limpieza** = Rol con permisos específicos de un área

---

### ¿Qué es un Permiso?

Un **permiso** es una acción específica que un rol puede realizar.

**Estructura de Permisos:**

```
MÓDULO_RECURSO_ACCIÓN

Ejemplos:
- RRHH_EMPLEADO_VIEW     (Ver empleados)
- RRHH_EMPLEADO_CREATE   (Crear empleados)
- RRHH_EMPLEADO_EDIT     (Editar empleados)
- RRHH_EMPLEADO_DELETE   (Eliminar empleados)
- NOMINA_PROCESO_EXECUTE (Ejecutar proceso de nómina)
```

**Los permisos están organizados en 4 niveles:**

1. **VIEW** (Ver) - 👁️ Solo consulta
2. **CREATE** (Crear) - ➕ Agregar nuevos registros
3. **EDIT** (Editar) - ✏️ Modificar registros existentes
4. **DELETE** (Eliminar) - 🗑️ Borrar registros

---

### Regla de Oro: Jerarquía de Permisos

⚠️ **Regla de Integridad del Sistema:**

> **"No puedes modificar lo que no puedes ver"**

El sistema implementa una **dependencia lógica automática**:

- Si asignas **CREATE**, automáticamente se asigna **VIEW**
- Si asignas **EDIT**, automáticamente se asigna **VIEW**
- Si asignas **DELETE**, automáticamente se asigna **VIEW**

**¿Por qué?**

Imagina que asignas "Editar Empleados" pero NO "Ver Empleados":
- El usuario intentaría editar
- No vería la lista de empleados
- No podría seleccionar QUÉ editar

**Por lo tanto, el sistema previene esto automáticamente.**

---

### Múltiples Roles por Usuario

✨ **Característica Avanzada:**

Un usuario puede tener **varios roles simultáneamente**, y sus permisos se **acumulan**.

**Ejemplo:**

Usuario: **María Gómez**
- Rol 1: "Asistente de RRHH" → Puede ver y crear empleados
- Rol 2: "Auditor Financiero" → Puede ver reportes de nómina

**Resultado:** María puede:
- ✅ Ver empleados
- ✅ Crear empleados
- ✅ Ver reportes de nómina
- ❌ Editar nómina (no tiene ese permiso en ninguno de sus roles)

**Beneficio:** Mayor flexibilidad para perfiles multifuncionales.

---

## <a name="roles"></a>2. Gestión de Roles

### Roles Predefinidos del Sistema

La plataforma incluye roles base que puede usar o personalizar:

| Rol | Descripción | Permisos Típicos | ¿Puede Modificarse? |
|-----|-------------|------------------|---------------------|
| **🔒 Administrador Root** | Super usuario del sistema | TODOS | ❌ No (Protegido) |
| **👑 Administrador de Empresa** | Control total de la empresa | Todos excepto Config. Sistema | ✅ Sí |
| **👥 Gerente de RRHH** | Gestión completa de personal | Ver, Crear, Editar empleados y nómina | ✅ Sí |
| **📊 Auditor** | Consulta sin modificación | Solo permisos VIEW | ✅ Sí |
| **👤 Empleado** | Usuario básico | Ver su propia información | ✅ Sí |

---

### Cómo Crear un Nuevo Rol

#### Paso 1: Planificar el Rol

Antes de crear, responda estas preguntas:

1. **¿Qué hará esta persona en su trabajo diario?**
   - Ejemplo: "Registrar nuevas contrataciones"

2. **¿Qué información necesita ver?**
   - Ejemplo: "Lista de empleados, documentos de contrato"

3. **¿Qué puede modificar?**
   - Ejemplo: "Crear nuevos empleados, subir documentos"

4. **¿Qué NO debe poder hacer?**
   - Ejemplo: "No debe eliminar empleados, no debe ver nómina"

---

#### Paso 2: Acceder a la Gestión de Roles

1. **Inicie sesión** con cuenta de Administrador

2. En el menú lateral, navegue a:
   ```
   Core → Seguridad → Gestión de Roles
   ```

3. Haga clic en el botón **"Crear Nuevo Rol"** (esquina superior derecha)

---

#### Paso 3: Información Básica

Complete el formulario:

**Nombre del Rol** (Obligatorio)
- Sea específico y descriptivo
- ✅ Buenos ejemplos:
  - "Coordinador de Contratación"
  - "Asistente de Nómina"
  - "Supervisor de Operaciones"
- ❌ Evite:
  - "Rol 1"
  - "Usuario"
  - "Temporal"

**Descripción** (Opcional pero recomendado)
- Explique cuándo usar este rol
- Ejemplo: *"Para personal de RRHH encargado únicamente del proceso de contratación. No incluye permisos de nómina."*

**Estado**
- ✅ Activo: El rol puede asignarse a usuarios
- ❌ Inactivo: El rol existe pero no puede asignarse (útil para roles temporales)

---

#### Paso 4: Selección de Permisos

Los permisos están **organizados por categorías funcionales**:

```
📦 MÓDULO: Recursos Humanos (RRHH)
   │
   ├─ 📂 CATEGORÍA: Gestión de Personal
   │   ├─ 👁️ Ver Empleados
   │   ├─ ➕ Crear Empleados
   │   ├─ ✏️ Editar Empleados
   │   └─ 🗑️ Eliminar Empleados
   │
   ├─ 📂 CATEGORÍA: Documentos
   │   ├─ 👁️ Ver Documentos
   │   ├─ ⬆️ Subir Documentos
   │   └─ ⬇️ Descargar Documentos
   │
   └─ 📂 CATEGORÍA: Reportes
       ├─ 👁️ Ver Reportes
       └─ 📊 Exportar Reportes
```

---

#### Métodos de Selección de Permisos

**Método 1: Selección Individual** (Más preciso)
- Marque casilla por casilla según necesite
- Recomendado para roles muy específicos

**Método 2: Selección por Recurso** (Rápido)
- Haga clic en "Seleccionar todo Empleados"
- Asigna todos los permisos relacionados con empleados (View, Create, Edit, Delete)
- Útil cuando quiere dar acceso completo a un área

**Método 3: Selección por Módulo** (Más amplio)
- Haga clic en "Seleccionar todo RRHH"
- Asigna TODOS los permisos del módulo de Recursos Humanos
- Útil para roles administrativos

---

#### Ejemplo Práctico: Crear Rol "Auditor de Nómina"

**Objetivo:** Usuario que puede revisar información pero no modificar nada.

**Permisos a asignar:**

✅ **Permitidos** (Solo VIEW):
```
RRHH_EMPLEADO_VIEW           (Ver lista de empleados)
RRHH_CONTRATO_VIEW           (Ver contratos)
NOMINA_PROCESO_VIEW          (Ver procesos de nómina)
NOMINA_DESPRENDIBLE_VIEW     (Ver desprendibles)
NOMINA_REPORTE_VIEW          (Ver reportes)
NOMINA_REPORTE_EXPORT        (Exportar reportes para análisis)
```

❌ **NO Permitidos**:
```
RRHH_EMPLEADO_EDIT           (No puede modificar empleados)
NOMINA_PROCESO_EXECUTE       (No puede ejecutar nómina)
NOMINA_DESPRENDIBLE_EDIT     (No puede editar desprendibles)
```

**Resultado:** Un auditor con acceso total de lectura para cumplimiento, sin riesgo de modificaciones accidentales.

---

#### Paso 5: Revisar y Guardar

1. **Revise la lista de permisos seleccionados**
   - Use la sección "Resumen de Permisos" en la parte inferior
   - Verá un contador: "15 permisos seleccionados"

2. **Verifique las dependencias automáticas**
   - El sistema mostrará en amarillo los permisos agregados automáticamente
   - Ejemplo: "VIEW fue agregado automáticamente porque seleccionó EDIT"

3. **Haga clic en "Guardar Rol"**

4. **Confirmación:**
   ```
   ✅ Rol "Auditor de Nómina" creado exitosamente
   ```

**El rol estará disponible inmediatamente para asignar a usuarios.**

---

### Cómo Editar un Rol Existente

1. Vaya a **"Gestión de Roles"**

2. Localice el rol en la tabla

3. Haga clic en el icono **✏️ Editar**

4. **Modifique** los permisos según necesite:
   - Agregue nuevos permisos
   - Quite permisos innecesarios

5. Haga clic en **"Guardar Cambios"**

⚠️ **Importante:** Los cambios se aplican **inmediatamente** a todos los usuarios con este rol. No necesitan cerrar sesión.

---

### Cómo Desactivar un Rol

Si un rol ya no es necesario pero no quiere eliminarlo:

1. Edite el rol

2. Cambie el **Estado** a **"Inactivo"**

3. Guarde

**Efecto:**
- Los usuarios que ya tienen el rol lo **conservan**
- **NO se puede asignar** a nuevos usuarios
- Aparece en la lista con estado "Inactivo" (puede reactivarse después)

---

### Cómo Eliminar un Rol

⚠️ **Precaución:** Esta acción es permanente.

**Antes de eliminar, verifique:**
- ¿Hay usuarios con este rol? → Reasígnelos primero
- ¿Es un rol del sistema? → No se puede eliminar (aparecerá con candado 🔒)

**Pasos:**

1. Vaya a **"Gestión de Roles"**

2. Haga clic en el icono **🗑️ Eliminar**

3. El sistema mostrará una advertencia:
   ```
   ⚠️ Este rol está asignado a 5 usuarios.
   Debe reasignarlos antes de eliminar.
   ```

4. Si no hay usuarios asignados, confirme la eliminación

---

## <a name="usuarios"></a>3. Gestión de Usuarios

### Cómo Invitar a un Nuevo Usuario

#### Paso 1: Acceder a la Gestión de Usuarios

```
Core → Gestión → Usuarios → "Crear Nuevo Usuario"
```

---

#### Paso 2: Información de Identidad

**Datos Obligatorios:**

**Username (Nombre de usuario)**
- Identificador único para iniciar sesión
- Solo letras minúsculas, números y guiones
- Ejemplo: `juan.perez` o `jperez2024`
- ⚠️ No puede cambiarse después de crear el usuario

**Email Corporativo**
- Debe coincidir con el dominio de su empresa
- Ejemplo: Si su dominio es `@miempresa.com`, el email debe ser `nombre@miempresa.com`
- Se enviará el correo de bienvenida a esta dirección

**Nombres y Apellidos**
- Nombre completo del colaborador
- Aparecerá en reportes y notificaciones

**Cargo/Posición** (Opcional)
- Título del puesto
- Ejemplo: "Analista de Nómina", "Gerente de Ventas"

---

#### Paso 3: Configuración de Acceso

**Contraseña Inicial**

El sistema ofrece dos opciones:

**Opción A: Generación Automática (Recomendado)**
- El sistema crea una contraseña segura aleatoria
- Ejemplo: `Kx9#mP2$qL4@`
- Se envía por correo al usuario
- ✅ Ventaja: Máxima seguridad

**Opción B: Contraseña Manual**
- Usted define la contraseña inicial
- Debe cumplir requisitos:
  - Mínimo 8 caracteres
  - Al menos 1 mayúscula
  - Al menos 1 minúscula
  - Al menos 1 número
  - Al menos 1 carácter especial (@, #, $, etc.)
- ⚠️ Desventaja: Menos segura si es predecible

**Cambio de Contraseña Obligatorio**
- ✅ **Recomendado:** Marque esta opción
- Efecto: En el primer inicio de sesión, el usuario **debe** cambiar su contraseña
- Beneficio: Solo el usuario conocerá su contraseña final

---

#### Paso 4: Asignación de Roles

**Selección de Roles:**

1. Haga clic en el campo **"Roles Asignados"**

2. Se desplegará la lista de roles disponibles

3. **Seleccione uno o varios roles**
   - Los roles aparecerán como "etiquetas" o "chips"
   - Puede asignar múltiples roles (los permisos se acumulan)

**Ejemplo de Asignación Múltiple:**

Usuario: **Carlos Rodríguez**
- Rol 1: "Coordinador de RRHH"
- Rol 2: "Auditor Financiero"

**Resultado:**
- Carlos tiene permisos de AMBOS roles
- Puede gestionar empleados (Coordinador) Y revisar finanzas (Auditor)

---

#### Paso 5: Envío de Invitación

1. Revise todos los datos

2. Haga clic en **"Crear Usuario"**

3. El sistema:
   ```
   ✅ Usuario creado exitosamente
   📧 Correo de bienvenida enviado a carlos.rodriguez@miempresa.com
   ```

**El usuario recibirá un correo con:**
- Su nombre de usuario
- Su contraseña temporal (si se generó automáticamente)
- Enlace directo para iniciar sesión
- Instrucciones de primer acceso

---

### Cómo Editar un Usuario Existente

#### Modificar Información Básica

1. Vaya a **"Gestión de Usuarios"**

2. Busque el usuario (use la barra de búsqueda si tiene muchos)

3. Haga clic en el icono **✏️ Editar**

**Puede modificar:**
- ✅ Nombres y apellidos
- ✅ Cargo
- ✅ Teléfono
- ✅ Roles asignados
- ❌ Username (bloqueado para mantener integridad)
- ❌ Email (requiere proceso especial de verificación)

4. Haga clic en **"Guardar Cambios"**

---

#### Agregar o Quitar Roles

**Para agregar un rol:**
1. Edite el usuario
2. En "Roles Asignados", seleccione el nuevo rol
3. Aparecerá como una nueva etiqueta
4. Guarde

**Para quitar un rol:**
1. Edite el usuario
2. Haga clic en la **"X"** de la etiqueta del rol que desea quitar
3. Guarde

⚠️ **Importante:** Si quita el último rol de un usuario, quedará sin acceso a ningún módulo (solo verá su perfil).

---

### Cómo Desactivar un Usuario

**Usar cuando:**
- El empleado está de licencia temporal
- Suspensión temporal del acceso
- Espera de aprobación de documentos

**NO elimine usuarios, desactívelos:**

1. Vaya a **"Gestión de Usuarios"**

2. Localice el usuario

3. Use el **interruptor de Estado** (Switch)
   - 🟢 Verde = Activo
   - 🔴 Rojo = Inactivo

4. Cambie a **Inactivo**

**Efecto inmediato:**
- El usuario no puede iniciar sesión
- Su información se conserva
- Puede reactivarse en cualquier momento

---

### Cómo Reactivar un Usuario

1. En **"Gestión de Usuarios"**, active el filtro **"Mostrar Inactivos"**

2. Localice el usuario inactivo

3. Cambie el interruptor de **Inactivo** a **Activo**

4. El usuario puede iniciar sesión inmediatamente

---

### Cómo Restablecer la Contraseña de un Usuario

**Escenario:** Un usuario olvidó su contraseña.

**Opción A: El Usuario Mismo (Autoservicio)**

1. El usuario va a la pantalla de login

2. Haga clic en **"¿Olvidó su contraseña?"**

3. Ingresa su correo electrónico

4. Recibe un enlace temporal para restablecer

5. Define su nueva contraseña

✅ **Recomendado:** El usuario mantiene el control de su contraseña

---

**Opción B: Restablecimiento por Administrador (Emergencia)**

1. Vaya a **"Gestión de Usuarios"**

2. Edite el usuario

3. Haga clic en **"Restablecer Contraseña"**

4. **Elija:**
   - Generar contraseña automática (se envía por correo)
   - Definir contraseña manual temporal

5. ✅ Marque **"Requerir cambio de contraseña en el próximo inicio"**

6. Guarde

**El usuario recibirá:**
- Correo con la nueva contraseña temporal
- Aviso de que debe cambiarla al iniciar sesión

---

## <a name="seguridad"></a>4. Seguridad y Contraseñas

### Política de Contraseñas Seguras

La plataforma implementa una **política de contraseñas robusta** para proteger su información.

#### Requisitos Mínimos

Toda contraseña debe cumplir:

| Requisito | Detalle | Ejemplo |
|-----------|---------|---------|
| **Longitud** | Mínimo 8 caracteres | `MyP@ss2024` |
| **Mayúsculas** | Al menos 1 letra mayúscula | `MyP@ss2024` |
| **Minúsculas** | Al menos 1 letra minúscula | `MyP@ss2024` |
| **Números** | Al menos 1 dígito | `MyP@ss2024` |
| **Especiales** | Al menos 1 símbolo (@, #, $, etc.) | `MyP@ss2024` |

---

#### ¿Qué NO usar como contraseña?

❌ **Contraseñas Débiles Comunes:**
- `123456` o `password`
- Su nombre o fecha de nacimiento
- Nombre de su empresa
- Secuencias de teclado (`qwerty`, `asdfgh`)
- Palabras del diccionario simples

❌ **Información Personal:**
- Nombres de familiares o mascotas
- Fechas importantes (aniversarios, cumpleaños)
- Números de documento

---

#### ✅ Recomendaciones para Contraseñas Seguras

**Método 1: Frases Memorables**
- Base: `Me gusta el café colombiano`
- Contraseña: `Mg3c@f3C0l0mb!4n0`
- Fácil de recordar, difícil de adivinar

**Método 2: Gestor de Contraseñas**
- Use herramientas como LastPass, 1Password o Bitwarden
- Generan contraseñas aleatorias ultra-seguras
- Solo debe recordar UNA contraseña maestra

**Método 3: Generador de la Plataforma**
- Deje que el sistema genere la contraseña
- Ejemplo: `Kx9#mP2$qL4@rN8%`
- Guárdela en su gestor de contraseñas

---

### Encriptación de Contraseñas (BCrypt)

**¿Cómo protegemos sus contraseñas?**

La plataforma usa **BCrypt**, un algoritmo de encriptación de nivel militar.

**Proceso:**

```
1. USUARIO CREA CONTRASEÑA
   Input: "MiContraseña123!"

2. SISTEMA ENCRIPTA (BCrypt)
   Procesamiento: Algoritmo de una sola vía
   
3. ALMACENAMIENTO EN BASE DE DATOS
   Guardado: "$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy"
   
4. VERIFICACIÓN DE INICIO DE SESIÓN
   ├─> Usuario ingresa: "MiContraseña123!"
   ├─> Sistema aplica BCrypt de nuevo
   ├─> Compara el resultado con el hash guardado
   └─> ✅ Coincide → Acceso permitido
```

**Beneficios:**

✅ **Irreversible:** Ni siquiera nosotros podemos ver su contraseña
✅ **Única:** Dos personas con la misma contraseña tendrán hashes diferentes
✅ **Resistente:** Protegido contra ataques de fuerza bruta

**Mensaje Clave:**
> "Si olvida su contraseña, nadie puede 'recuperarla'. Solo puede crear una nueva."

---

### Protección Contra Ataques de Fuerza Bruta

**¿Qué es un ataque de fuerza bruta?**

Un atacante intenta adivinar su contraseña probando miles de combinaciones automáticamente.

**Cómo le protegemos:**

#### Rate Limiting (Límite de Intentos)

```
Intento 1: ❌ Contraseña incorrecta
Intento 2: ❌ Contraseña incorrecta
Intento 3: ❌ Contraseña incorrecta
Intento 4: ❌ Contraseña incorrecta
Intento 5: ❌ Contraseña incorrecta
───────────────────────────────────
🚨 Intento 6: BLOQUEADO POR 60 SEGUNDOS
```

**Funcionalidad:**
- Máximo **5 intentos fallidos** consecutivos
- Bloqueo temporal de **1 minuto**
- Contador visible: "Por favor espera 59 segundos..."
- Auditoría: Todos los intentos bloqueados se registran

**Beneficio:** Un atacante necesitaría **años** para probar combinaciones comunes.

---

### Expiración de Sesiones

**¿Qué son las sesiones?**

Cuando inicia sesión, el sistema genera un "token" temporal que prueba su identidad.

**Configuración de Seguridad:**

| Tipo de Token | Duración | Propósito |
|---------------|----------|-----------|
| **Access Token** | 1 hora | Acceso normal a la plataforma |
| **Refresh Token** | 7 días | Renovación silenciosa de sesión |

**¿Qué significa esto para usted?**

1. **Durante su trabajo diario:**
   - Su sesión se renueva automáticamente cada hora
   - No necesita volver a iniciar sesión

2. **Si cierra la plataforma:**
   - Puede volver dentro de 7 días sin iniciar sesión de nuevo

3. **Después de 7 días de inactividad:**
   - Debe iniciar sesión nuevamente (seguridad)

**Caso especial: Seguridad Máxima**

Si accede desde una computadora pública o compartida:
- ✅ Cierre sesión manualmente al terminar (botón "Cerrar Sesión")
- ✅ No marque "Recordar mi sesión"

---

### Auditoría de Accesos

**Transparencia Total:**

Cada inicio de sesión se registra automáticamente:

**Información Capturada:**
- 📅 Fecha y hora exacta
- 📍 Dirección IP del dispositivo
- 💻 Tipo de navegador y sistema operativo
- ✅ Resultado (exitoso / fallido)
- ❌ Razón de fallo (si aplica)

**¿Cómo revisar?**

1. Vaya a **"Auditoría"** → **"Registros de Acceso"**

2. Filtre por:
   - Usuario específico
   - Rango de fechas
   - Tipo de evento (login exitoso / fallido)

3. **Ejemplo de registro:**
   ```
   Usuario: carlos.rodriguez
   Fecha: 2024-01-15 14:32:05
   IP: 190.85.43.21
   Navegador: Chrome 120 en Windows 11
   Estado: ✅ Exitoso
   ```

**Detecte actividad sospechosa:**
- Inicios de sesión desde ubicaciones inusuales
- Múltiples intentos fallidos
- Accesos fuera del horario laboral

---

## <a name="casos"></a>5. Casos de Uso Prácticos

### Caso 1: Crear Rol "Asistente de Contratación"

**Perfil del Usuario:**
- Se encarga del proceso de contratación
- Necesita crear nuevos empleados
- No debe ver información de nómina
- No puede eliminar empleados

**Permisos a Asignar:**

✅ **Recursos Humanos:**
```
RRHH_EMPLEADO_VIEW           (Ver empleados)
RRHH_EMPLEADO_CREATE         (Crear empleados)
RRHH_EMPLEADO_EDIT           (Editar empleados - solo datos básicos)
RRHH_DOCUMENTO_VIEW          (Ver documentos)
RRHH_DOCUMENTO_UPLOAD        (Subir contratos)
```

❌ **NO Asignar:**
```
RRHH_EMPLEADO_DELETE         (No puede eliminar)
NOMINA_*                     (Sin acceso a nómina)
```

**Resultado:** Un rol especializado en onboarding sin riesgo de modificaciones críticas.

---

### Caso 2: Crear Rol "Supervisor de Departamento"

**Perfil del Usuario:**
- Supervisa un equipo específico
- Puede ver información de su equipo
- Aprueba solicitudes de vacaciones
- No puede acceder a otras áreas

**Permisos a Asignar:**

✅ **Recursos Humanos (Limitado):**
```
RRHH_EMPLEADO_VIEW           (Ver empleados de su departamento)
RRHH_ASISTENCIA_VIEW         (Ver asistencias)
RRHH_VACACIONES_APPROVE      (Aprobar vacaciones)
RRHH_REPORTE_VIEW            (Ver reportes de su equipo)
```

❌ **NO Asignar:**
```
RRHH_EMPLEADO_EDIT           (No puede modificar datos permanentes)
NOMINA_*                     (Sin acceso a salarios)
ADMIN_*                      (Sin permisos administrativos)
```

**Nota Técnica:** El filtro por departamento se aplica automáticamente en la capa de negocio según el usuario autenticado.

---

### Caso 3: Onboarding de Empleado Nuevo

**Escenario:** Contrató a Ana Martínez como Analista de Marketing.

**Paso a Paso:**

1. **Crear Usuario:**
   ```
   Username: ana.martinez
   Email: ana.martinez@miempresa.</parameter>
<parameter name="new_str">**Escenario:** Contrató a Ana Martínez como Analista de Marketing.

**Paso a Paso:**

1. **Crear Usuario:**
   ```
   Username: ana.martinez
   Email: ana.martinez@miempresa.com
   Nombre: Ana María Martínez López
   Cargo: Analista de Marketing
   ```

2. **Asignar Rol:**
   - Rol: "Empleado" (rol básico predefinido)

3. **Configuración de Seguridad:**
   - ✅ Generar contraseña automática
   - ✅ Requerir cambio en primer acceso

4. **Enviar Invitación:**
   - Ana recibe correo de bienvenida
   - Incluye sus credenciales temporales
   - Link directo a la plataforma

5. **Primer Acceso de Ana:**
   - Inicia sesión con credenciales temporales
   - Sistema la obliga a cambiar contraseña
   - Define su contraseña personal segura
   - Accede a su perfil y módulos permitidos

**Tiempo total:** 3-5 minutos.

---

### Caso 4: Empleado Cambia de Departamento

**Escenario:** Carlos era "Asistente de Ventas" y ahora es "Coordinador de RRHH".

**Pasos:**

1. **Editar Usuario:**
   - Busque a Carlos en "Gestión de Usuarios"
   - Haga clic en Editar

2. **Actualizar Cargo:**
   - Cambie "Cargo" de "Asistente de Ventas" a "Coordinador de RRHH"

3. **Reasignar Roles:**
   - **Quitar:** Rol "Empleado de Ventas"
   - **Agregar:** Rol "Coordinador de RRHH"

4. **Guardar Cambios**

5. **Notificar a Carlos:**
   - Envíele un correo explicando sus nuevos permisos
   - Carlos verá los cambios la próxima vez que navegue

**Efecto Inmediato:**
- Carlos pierde acceso al módulo de Ventas
- Carlos gana acceso al módulo de RRHH
- No necesita cerrar sesión

---

### Caso 5: Usuario Sospecha de Acceso No Autorizado

**Escenario:** María ve movimientos que no reconoce en su cuenta.

**Protocolo de Seguridad:**

1. **Investigación Inicial (Administrador):**
   - Vaya a **"Auditoría"** → **"Registros de Acceso"**
   - Filtre por el usuario "maría.gomez"
   - Revise los últimos 7 días

2. **Análisis de Patrones:**
   ```
   ✅ Normal:
   2024-01-15 09:00 - IP: 190.85.43.21 (Oficina)
   2024-01-15 14:30 - IP: 190.85.43.21 (Oficina)
   
   🚨 Sospechoso:
   2024-01-16 03:00 - IP: 45.123.67.89 (Ubicación: China)
   ```

3. **Acción Inmediata:**
   - Desactive el usuario temporalmente (Switch a Inactivo)
   - Contacte a María para confirmar

4. **Resolución:**
   - Si fue María: Reactivar cuenta
   - Si NO fue María:
     - Mantener cuenta desactivada
     - Restablecer contraseña
     - Reportar a seguridad

5. **Prevención Futura:**
   - Educar a María sobre contraseñas seguras
   - Verificar que use autenticación de dos factores (si está disponible)
   - Revisar dispositivos autorizados

---

## <a name="problemas"></a>6. Solución de Problemas

### Problema: "No puedo asignar un rol a un usuario"

**Síntomas:**
- El menú de roles está vacío
- El rol que busco no aparece

**Causas y Soluciones:**

| Causa | Solución |
|-------|----------|
| **El rol está Inactivo** | Active el rol en "Gestión de Roles" |
| **No tiene permisos** | Su rol debe tener `ADMIN_ROLE_ASSIGN` |
| **El rol fue eliminado** | Debe recrear el rol |
| **Caché del navegador** | Presione Ctrl+F5 para refrescar |

---

### Problema: "Un usuario no puede iniciar sesión"

**Diagnóstico paso a paso:**

1. **Verifique el estado del usuario:**
   - ¿Está Activo? (Switch verde)
   - Si está Inactivo, actívelo

2. **Verifique el correo del usuario:**
   - ¿Coincide con el dominio de su empresa?
   - ¿Está verificado?

3. **Verifique si hay bloqueo por Rate Limit:**
   - ¿Intentó más de 5 veces con contraseña incorrecta?
   - Espere 1 minuto o restablezca su contraseña

4. **Revise los roles asignados:**
   - ¿Tiene al menos UN rol asignado?
   - Si no tiene roles, asígnele uno

5. **Restablezca la contraseña:**
   - Use la opción "Restablecer Contraseña"
   - Marque "Requerir cambio en próximo acceso"

---

### Problema: "Un usuario tiene demasiados permisos"

**Síntoma:** Puede ver o modificar información que no debería.

**Solución:**

1. **Identifique los roles del usuario:**
   - Edite el usuario
   - Revise TODOS los roles asignados
   - Recuerde: Los permisos se acumulan

2. **Revise cada rol:**
   - ¿Qué permisos tiene cada rol?
   - ¿Cuál está otorgando el acceso no deseado?

3. **Corrija:**
   - **Opción A:** Quite el rol problemático del usuario
   - **Opción B:** Edite el rol para quitar permisos excesivos

4. **Pruebe:**
   - Pida al usuario que refresque la página
   - Verifique que ya no puede acceder a la información

---

### Problema: "Un rol no se puede eliminar"

**Mensaje:** "No puede eliminar este rol porque está en uso"

**Solución:**

1. **Identifique usuarios con este rol:**
   ```
   Filtro en "Gestión de Usuarios":
   - Busque por "Rol: [Nombre del Rol]"
   - Verá la lista de usuarios afectados
   ```

2. **Reasigne usuarios:**
   - Para cada usuario:
     - Quite el rol que desea eliminar
     - Asigne un rol alternativo

3. **Intente eliminar de nuevo:**
   - Ahora debería permitir la eliminación

**Alternativa:** Si no quiere reasignar usuarios, simplemente **Desactive** el rol en lugar de eliminarlo.

---

### Problema: "No veo el módulo que debería ver"

**Escenario:** Un usuario tiene el rol correcto pero no ve un módulo (ej: Nómina).

**Causas posibles:**

1. **Suscripción de Empresa:**
   - ¿Su empresa tiene contratado ese módulo?
   - Contacte al Super Administrador o Ventas

2. **Permisos del Rol:**
   - Verifique que el rol tenga al menos UN permiso `_VIEW` del módulo
   - Ejemplo: `NOMINA_PROCESO_VIEW`

3. **Estado del Usuario:**
   - ¿El usuario está Activo?

4. **Caché del Navegador:**
   - Presione Ctrl+Shift+R para limpiar caché
   - O cierre sesión e inicie de nuevo

---

### Problema: "Contraseña temporal no funciona"

**Síntoma:** Usuario intenta iniciar sesión con contraseña enviada por correo y falla.

**Soluciones:**

1. **Verifique el correo:**
   - ¿Copió la contraseña correctamente?
   - ⚠️ Cuidado con espacios al inicio/final

2. **Verifique el tiempo:**
   - ¿Cuándo se generó la contraseña?
   - Las contraseñas temporales expiran en 24 horas

3. **Restablezca de nuevo:**
   - Use "Restablecer Contraseña" en "Gestión de Usuarios"
   - Genere una nueva contraseña temporal

4. **Verifique el username:**
   - ¿El usuario está usando el username correcto?
   - No es el email, es el identificador único (ej: `jperez`)

---

## 📞 Soporte y Contacto

### ¿Necesita Ayuda?

**Soporte Técnico:**
- 📧 Email: soporte@plataforma.com
- 📱 WhatsApp: +57 300 123 4567
- 💬 Chat en vivo: Disponible en la esquina inferior derecha

**Seguridad y Accesos:**
- 🚨 Email urgente: seguridad@plataforma.com
- Incluya en su reporte:
  - Username del usuario afectado
  - Descripción del problema
  - Capturas de pantalla (si aplica)

---

## ✅ Checklist de Seguridad Mensual

Como administrador, realice estas verificaciones cada mes:

### Usuarios

- [ ] Revisar lista de usuarios Activos vs. Inactivos
- [ ] Verificar que usuarios inactivos temporales sean reactivados o eliminados
- [ ] Confirmar que no haya usuarios sin roles asignados
- [ ] Revisar usuarios que no han iniciado sesión en 90+ días

### Roles

- [ ] Revisar permisos de cada rol
- [ ] Eliminar roles que ya no se usan
- [ ] Verificar que roles de sistema estén protegidos
- [ ] Documentar cambios en descripciones de roles

### Seguridad

- [ ] Revisar registros de acceso sospechosos
- [ ] Verificar intentos fallidos de inicio de sesión
- [ ] Revisar accesos fuera del horario laboral
- [ ] Confirmar que no haya cuentas compartidas

### Auditoría

- [ ] Exportar reporte de accesos del mes
- [ ] Revisar cambios en permisos críticos
- [ ] Verificar cumplimiento de política de contraseñas
- [ ] Documentar incidentes de seguridad (si los hubo)

---

## 🎓 Mejores Prácticas de Gestión

### Principio de Menor Privilegio

> **"Otorgue solo los permisos necesarios para realizar el trabajo, nada más."**

**Ejemplo:**

❌ **Mal:**
- Asignar rol "Administrador" a todos los gerentes

✅ **Bien:**
- Crear roles específicos:
  - "Gerente de Ventas" (solo acceso a Ventas)
  - "Gerente de RRHH" (solo acceso a RRHH)
  - "Gerente de Finanzas" (solo acceso a Finanzas)

---

### Rotación de Contraseñas

**Recomendación:**

Cada 90 días, los usuarios con acceso a información crítica deben:
- Cambiar su contraseña
- Verificar sus dispositivos autorizados
- Revisar su actividad reciente

**Cómo implementar:**

1. Identifique usuarios críticos (Admin, Finanzas, RRHH)
2. Envíeles recordatorio por correo
3. Use el sistema de auditoría para verificar cumplimiento

---

### Documentación de Roles

Mantenga un documento actualizado (puede ser en Excel o Google Sheets):

| Rol | Descripción | Permisos Clave | Usuarios Asignados | Última Revisión |
|-----|-------------|----------------|---------------------|-----------------|
| Coordinador RRHH | Gestión de personal | RRHH_* (excepto DELETE) | 3 | 2024-01-15 |
| Auditor | Solo consulta | *_VIEW, REPORTE_EXPORT | 2 | 2024-01-10 |

**Beneficio:** Si un rol causa problemas, puede rastrear su evolución y revertir cambios.

---

### Capacitación de Usuarios

Cuando asigne un nuevo rol a un usuario:

1. **Notifíquele por correo**
2. **Explique brevemente sus nuevos permisos**
3. **Comparta esta guía**
4. **Ofrezca una sesión de capacitación** (si es un rol complejo)

**Ejemplo de correo:**

```
Hola Carlos,

Te informamos que se te ha asignado el rol de "Coordinador de RRHH".

Con este rol puedes:
✅ Ver y crear empleados
✅ Subir documentos de contratación
✅ Generar reportes de personal

No puedes:
❌ Eliminar empleados
❌ Modificar nómina

Si tienes dudas, consulta el Manual de Autogestión de Usuarios
o contáctanos.

Saludos,
Equipo de TI
```

---

## 🎉 Felicitaciones

Ha completado el Manual de Autogestión de Usuarios y Roles. Ahora tiene el conocimiento para:

1. ✅ Crear roles personalizados según las necesidades de su empresa
2. ✅ Invitar y gestionar usuarios de forma autónoma
3. ✅ Mantener la seguridad de su organización
4. ✅ Diagnosticar y resolver problemas comunes
5. ✅ Implementar mejores prácticas de gestión de accesos

**Recuerde:** La seguridad es responsabilidad de todos. Un buen sistema de roles y permisos protege tanto a la empresa como a los empleados.

---

*Manual versión 1.0 - Última actualización: Enero 2026*
*Este documento es parte de la serie de manuales para administradores.*

**Documentos relacionados:**
- Manual de Bienvenida para el Administrador de la Empresa
- Guía de Gestión de Archivos y Documentos