# Manual de Bienvenida para el Administrador de la Empresa

## 🎯 Introducción

¡Bienvenido a su nueva plataforma de gestión empresarial! Este manual lo guiará paso a paso para configurar su empresa y comenzar a aprovechar todas las funcionalidades del sistema.

---

## 📋 Índice

1. [Protocolos de Seguridad y Protección de Datos](#seguridad)
2. [Configuración Inicial de su Empresa](#configuracion)
3. [Gestión de Roles y Permisos](#roles)
4. [Preguntas Frecuentes](#faq)

---

## <a name="seguridad"></a>1. Protocolos de Seguridad y Protección de Datos

### ¿Cómo protegemos su información?

Su tranquilidad es nuestra prioridad. Por eso implementamos **aislamiento total de datos** (también conocido como Multi-tenancy), que funciona como tener su propia bóveda digital privada.

#### 🔒 Aislamiento Lógico: Su Espacio Privado

**¿Qué significa esto para usted?**

Imagine que la plataforma es un edificio de oficinas moderno. Aunque muchas empresas comparten el mismo edificio (la plataforma), cada una tiene:

- Su propia oficina con llave única
- Archivos guardados en su propio archivador con cerradura
- Personal que solo puede acceder a SU oficina

**En términos técnicos simplificados:**

✅ **Cada consulta está "blindada"**: Cuando alguien de su empresa busca información, el sistema automáticamente filtra todo para mostrar SOLO los datos de su organización.

✅ **Archivos protegidos por empresa**: Sus documentos, logos y archivos se guardan en una carpeta digital identificada únicamente con el código de su empresa. Nadie más puede ver ni acceder a estos archivos.

✅ **Acceso controlado por rol**: Solo las personas que usted autorice, con los permisos que usted defina, pueden ver o modificar información específica.

#### 🛡️ ¿Cómo funciona en la práctica?

Cada vez que un usuario de su empresa:
- Sube un documento
- Busca información de empleados
- Genera un reporte
- Accede a cualquier funcionalidad

**El sistema verifica automáticamente:**

1. ¿Esta persona pertenece a esta empresa? ✓
2. ¿Tiene permiso para realizar esta acción? ✓
3. ¿Los datos solicitados pertenecen a su empresa? ✓

Solo si las tres respuestas son "SÍ", se permite el acceso.

#### 📐 Diagrama Visual del Flujo de Seguridad

```
┌─────────────┐
│   USUARIO   │
│   (María)   │
└──────┬──────┘
       │
       ↓
┌─────────────────────────────┐
│  FILTRO DE EMPRESA          │
│  "¿Pertenece a Tech         │
│   Solutions (ID: 12345)?"   │
└──────┬──────────────────────┘
       │ ✓ SÍ
       ↓
┌─────────────────────────────┐
│  FILTRO DE PERMISOS         │
│  "¿Tiene rol autorizado?"   │
└──────┬──────────────────────┘
       │ ✓ SÍ
       ↓
┌─────────────────────────────┐
│     SUS DATOS               │
│  (Solo Tech Solutions)      │
└─────────────────────────────┘
```

**Nota:** Este proceso sucede en milisegundos, de forma completamente transparente para el usuario.

#### 📊 Ejemplo Real

Imagina que tienes dos empresas en la plataforma:
- **Empresa A**: "Tech Solutions Ltda."
- **Empresa B**: "Servicios Globales S.A.S."

**Escenario**: María, gerente de "Tech Solutions", busca el reporte de nómina.

**Lo que sucede detrás de escena:**

```
Sistema: "María pertenece a Tech Solutions (ID: 12345)"
Sistema: "Filtro de seguridad activado → Solo datos de ID: 12345"
Sistema: "María tiene rol 'Gerente de RRHH' → Permiso verificado ✓"
Resultado: María ve ÚNICAMENTE la nómina de Tech Solutions
```

**Lo que NO puede suceder:**
- María NO puede ver datos de "Servicios Globales"
- María NO puede acceder a archivos de otras empresas
- María NO puede modificar información fuera de sus permisos

---

#### 🔐 Tecnologías de Protección

Aunque no necesita conocer los detalles técnicos, le compartimos las capas de seguridad implementadas:

**1. Autenticación Multi-Factor**
- Contraseñas encriptadas con BCrypt (imposibles de descifrar)
- Tokens de sesión temporales que expiran automáticamente
- Verificación de identidad en cada acción importante

**2. Protección de Archivos**
- Sistema de almacenamiento aislado (MinIO)
- URLs de acceso temporal (expiran en 1 hora)
- Escaneo antivirus automático (ClamAV)

**¿Cómo funciona el Antivirus Automático?**

Cada vez que alguien sube un archivo (PDF, imagen, Excel, etc.), el sistema:

1. **Intercepta el archivo** antes de guardarlo
2. **Lo escanea con ClamAV** (software antivirus profesional)
3. **Bloquea amenazas** como virus, malware o archivos sospechosos
4. **Solo guarda archivos limpios** en su carpeta empresarial

**Resultado:** Si un archivo es rechazado, significa que el antivirus detectó algo sospechoso. Esto es una PROTECCIÓN, no un error.

**¿Qué hacer si un archivo es rechazado?**
- Verifique que el archivo no contenga macros sospechosas (común en archivos Excel)
- Asegúrese de que el archivo provenga de una fuente confiable
- Si es un archivo legítimo de su empresa, contacte a su equipo de TI o a nuestro soporte
- Nunca intente desactivar esta protección por conveniencia

**3. Auditoría Completa**
- Registro de cada inicio de sesión
- Historial de cambios importantes
- Alertas de actividad sospechosa

**4. Protección contra Ataques**
- Límite de intentos de inicio de sesión (5 intentos máximo)
- Bloqueo temporal tras intentos fallidos
- Protección contra robo de sesión (CSRF/XSRF)

---

#### ✅ Su Información está Segura Porque:

| Protección | Beneficio para Usted |
|------------|----------------------|
| **Aislamiento por Empresa** | Sus datos NUNCA se mezclan con los de otras organizaciones |
| **Roles y Permisos** | Usted decide quién ve qué información |
| **Encriptación** | Las contraseñas son ilegibles incluso para nosotros |
| **Copias de Seguridad** | Sus datos están respaldados automáticamente |
| **Auditoría** | Puede rastrear quién accedió a qué y cuándo |
| **Actualizaciones de Seguridad** | Protección constante contra nuevas amenazas |

---

#### 📞 Soporte en Seguridad

Si en algún momento tiene dudas sobre:
- Actividad sospechosa en una cuenta
- Permisos de un usuario
- Acceso no autorizado

**Contáctenos inmediatamente:**
- 📧 Email: seguridad@suempresa.com
- 📱 Teléfono: +57 (1) 234-5678
- 💬 Chat en vivo: Disponible 24/7

---

### 🎓 Resumen para Recordar

> **"Su información está en una bóveda digital privada. Solo las personas que usted autorice, con las llaves (permisos) que usted entregue, pueden acceder a su información. Nadie más puede ver, modificar o eliminar sus datos."**

---

## <a name="configuracion"></a>2. Configuración Inicial de su Empresa

### Paso 1: Acceder a la Configuración de Empresa

1. Inicie sesión en la plataforma
2. En el menú lateral izquierdo, busque **"Configuración"** o **"Core"**
3. Haga clic en **"Gestión de Empresas"**
4. Seleccione su empresa de la lista

### Paso 2: Información Básica de la Empresa

Complete o verifique los siguientes datos:

**Información Legal y Fiscal:**
- Nombre comercial
- Razón social
- NIT (Número de Identificación Tributaria)
- Sector económico

**Información de Contacto:**
- Correo electrónico corporativo
- Teléfono principal
- Extensión de correo permitida (ej: @miempresa.com)

**Ubicación:**
- País
- Departamento/Estado
- Ciudad
- Dirección física completa

### Paso 3: Configurar su Logo Corporativo

El logo de su empresa aparecerá en:
- Pantalla de inicio de sesión
- Barra superior de navegación
- Reportes generados
- Correos electrónicos del sistema

**¿Cómo subir su logo?**

1. En la página de configuración de empresa, busque la sección **"Branding"**
2. Haga clic en el área de **"Cargar Logo"**
3. Seleccione su archivo (formatos permitidos: PNG, JPG, SVG)
4. **Recomendaciones:**
   - Tamaño mínimo: 200x200 píxeles
   - Tamaño máximo de archivo: 2MB
   - Preferiblemente con fondo transparente (PNG)
   - Formato cuadrado o rectangular horizontal

5. El sistema mostrará una vista previa
6. Haga clic en **"Guardar"**

**Resultado:** Su logo aparecerá inmediatamente en toda la plataforma para todos los usuarios de su empresa.

### Paso 4: Personalización de Color Corporativo

Además del logo, puede definir el color principal de su marca:

1. En la sección **"Branding"**, encontrará un selector de color
2. Haga clic en el cuadro de color
3. Seleccione el color principal de su empresa (ej: el azul de su logo)
4. El sistema aplicará este color a:
   - Botones principales
   - Enlaces
   - Encabezados
   - Elementos interactivos

5. Haga clic en **"Guardar Cambios"**

**Nota:** Estos cambios son visibles SOLO para los usuarios de su empresa. Cada empresa en la plataforma tiene su propia identidad visual.

---

## <a name="roles"></a>3. Gestión de Roles y Permisos

### ¿Qué es un Rol?

Un **rol** es como una "plantilla de permisos" que define qué puede hacer un usuario en el sistema.

**Ejemplo en la vida real:**
- **Gerente de RRHH**: Puede ver, crear y editar empleados, generar reportes
- **Asistente de Nómina**: Puede ver empleados y procesar nómina, pero NO puede eliminar registros
- **Supervisor**: Solo puede ver información de su departamento

### Roles Predefinidos del Sistema

La plataforma incluye roles básicos que puede usar o personalizar:

| Rol | Descripción | Permisos Típicos |
|-----|-------------|------------------|
| **Administrador de Empresa** | Control total de la empresa | Todo (excepto configuración de plataforma) |
| **Gerente de RRHH** | Gestión completa de empleados | Ver, crear, editar empleados y nómina |
| **Supervisor** | Supervisión de equipo | Ver información de su departamento |
| **Empleado** | Usuario básico | Ver su propia información y documentos |

---

### Cómo Crear un Nuevo Rol

#### Paso 1: Acceder a Gestión de Roles

1. Menú lateral → **"Seguridad"** o **"Core"**
2. Clic en **"Gestión de Roles"**
3. Botón **"Crear Nuevo Rol"**

#### Paso 2: Información Básica del Rol

Complete:
- **Nombre del rol**: Descriptivo y claro (ej: "Analista de Nómina")
- **Descripción**: Explique brevemente para qué sirve este rol

#### Paso 3: Asignar Permisos

Los permisos están organizados por categorías funcionales:

**Categoría: Recursos Humanos**
- 👁️ Ver empleados
- ➕ Crear empleados
- ✏️ Editar empleados
- 🗑️ Eliminar empleados
- 📄 Exportar reportes

**Categoría: Nómina**
- 👁️ Ver nómina
- ✏️ Procesar nómina
- 📊 Generar reportes de nómina

**Categoría: Configuración**
- ⚙️ Configurar empresa
- 👥 Gestionar usuarios
- 🔒 Gestionar roles

**¿Cómo seleccionar permisos?**

1. **Opción 1 - Selección Individual**: 
   - Marque casilla por casilla según necesite

2. **Opción 2 - Selección por Recurso**:
   - Haga clic en "Seleccionar todo Empleados" para dar todos los permisos de empleados

3. **Opción 3 - Selección por Módulo**:
   - Haga clic en "Seleccionar todo RRHH" para dar acceso completo al módulo

**Lógica de Dependencias Automática:**

⚠️ **Importante - Regla de Integridad de Seguridad**: 

El sistema implementa una **Regla de Coherencia Lógica** que protege la integridad de los permisos:

> **"No puedes modificar lo que no puedes ver"**

Si marca un permiso de "Crear", "Editar" o "Eliminar", el sistema automáticamente selecciona "Ver" del mismo recurso.

**¿Por qué?**

Imagine que un usuario tiene permiso para "Editar Empleados" pero NO puede "Ver Empleados". Esto crearía una situación absurda:
- El usuario intentaría editar un empleado
- El sistema le negaría ver la lista de empleados
- El usuario no podría seleccionar QUÉ empleado editar

**Por lo tanto, el sistema previene esto automáticamente.**

**Ejemplo práctico:**
- ✅ Si marca: ✏️ "Editar empleados"
- ⚡ El sistema marca automáticamente: 👁️ "Ver empleados"
- ❌ Si desmarca: 👁️ "Ver empleados"
- ⚡ El sistema desmarca automáticamente: ✏️ "Editar", ➕ "Crear" y 🗑️ "Eliminar"

Esta es una **protección de seguridad inteligente**, no una limitación.

#### Paso 4: Guardar el Rol

1. Revise todos los permisos seleccionados
2. Haga clic en **"Guardar Rol"**
3. El rol estará disponible inmediatamente para asignar a usuarios

---

### Cómo Asignar un Rol a un Usuario

#### Opción A: Al Crear un Nuevo Usuario

1. Vaya a **"Gestión de Usuarios"** → **"Crear Usuario"**
2. Complete la información básica (nombre, correo, usuario)
3. En la sección **"Asignación de Roles"**:
   - Seleccione uno o varios roles del menú desplegable
   - Los roles aparecerán como "etiquetas" o "chips"
   - Puede asignar múltiples roles a un mismo usuario

4. Haga clic en **"Crear Usuario"**

**El usuario recibirá:**
- Un correo electrónico de bienvenida
- Una contraseña temporal
- Instrucciones para su primer inicio de sesión

#### Opción B: Editar un Usuario Existente

1. Vaya a **"Gestión de Usuarios"**
2. Busque el usuario en la lista
3. Haga clic en el icono de **"Editar"** (lápiz)
4. En **"Roles Asignados"**:
   - Agregue nuevos roles haciendo clic en el selector
   - Elimine roles haciendo clic en la "X" de cada etiqueta
5. Haga clic en **"Guardar Cambios"**

**Los cambios son inmediatos:** El usuario verá sus nuevos permisos la próxima vez que navegue o al refrescar la página.

---

### Mejores Prácticas en Gestión de Roles

#### ✅ Recomendaciones:

1. **Principio de Menor Privilegio**
   - Otorgue solo los permisos necesarios para cada rol
   - Es mejor crear roles específicos que dar permisos excesivos

2. **Nombres Descriptivos**
   - ✅ "Asistente de Contabilidad"
   - ❌ "Rol 3"

3. **Documentar Roles**
   - Use la descripción para explicar cuándo usar cada rol
   - Ejemplo: "Para personal temporal de temporada alta"

4. **Revisión Periódica**
   - Cada 6 meses, revise si los permisos siguen siendo apropiados
   - Elimine roles que ya no se usan

5. **Múltiples Roles para Flexibilidad**
   - Puede asignar varios roles a un usuario
   - Los permisos se acumulan (el usuario tendrá la suma de todos)

#### ⚠️ Precauciones:

1. **Roles de Sistema Protegidos**
   - Algunos roles (como "Administrador Raíz") no pueden modificarse
   - Están marcados con un candado 🔒

2. **No Elimine Roles en Uso**
   - Si un rol está asignado a usuarios, primero reasigne los usuarios
   - El sistema le advertirá antes de eliminar

3. **Pruebe Antes de Producción**
   - Cree un usuario de prueba
   - Asígnele el nuevo rol
   - Verifique que tiene los accesos correctos
   - Luego aplique a usuarios reales

---

## <a name="faq"></a>4. Preguntas Frecuentes

### Sobre Seguridad

**P: ¿Pueden otras empresas ver mi información?**
R: No, absolutamente no. Cada empresa tiene un aislamiento total. Es técnicamente imposible que datos de una empresa se filtren a otra.

**P: ¿Qué pasa si olvido mi contraseña?**
R: Use la opción "¿Olvidó su contraseña?" en la pantalla de inicio de sesión. Recibirá un correo con instrucciones para restablecerla.

**P: ¿Puedo ver quién accedió al sistema?**
R: Sí, vaya a "Auditoría" → "Registros de Acceso" para ver un historial completo de inicios de sesión.

### Sobre Configuración de Empresa

**P: ¿Puedo cambiar mi logo después?**
R: Sí, puede cambiar su logo en cualquier momento. Los cambios se aplican inmediatamente.

**P: ¿El color corporativo afecta a otras empresas?**
R: No, cada empresa tiene su propia personalización visual independiente.

**P: ¿Necesito suscribirme a módulos adicionales?**
R: El Super Administrador de la plataforma puede habilitar o deshabilitar módulos para su empresa según su plan contratado.

### Sobre Roles y Usuarios

**P: ¿Cuántos roles puedo crear?**
R: Puede crear roles ilimitados. Le recomendamos crear roles específicos para cada función en su empresa.

**P: ¿Puedo asignar varios roles a un usuario?**
R: Sí, un usuario puede tener múltiples roles. Los permisos se acumulan (tendrá acceso a todo lo que permitan sus roles).

**P: ¿Qué pasa si elimino un rol que tiene usuarios asignados?**
R: El sistema le advertirá y le pedirá reasignar los usuarios a otro rol antes de eliminar.

**P: ¿Los empleados pueden cambiar sus propios roles?**
R: No, solo los administradores pueden asignar o modificar roles.

**P: ¿Puedo tener un usuario inactivo temporalmente?**
R: Sí, puede desactivar un usuario sin eliminarlo. Use el switch de "Estado" en la lista de usuarios.

### Sobre el Sistema

**P: ¿Necesito instalar algo?**
R: No, es 100% web. Solo necesita un navegador moderno (Chrome, Firefox, Edge, Safari).

**P: ¿Funciona en celular?**
R: Sí, la interfaz es completamente responsiva y funciona en cualquier dispositivo.

**P: ¿Con qué frecuencia se actualiza el sistema?**
R: Las actualizaciones de seguridad son automáticas. Las nuevas funcionalidades se implementan gradualmente sin afectar su trabajo.

---

## 📞 Soporte y Contacto

### ¿Necesita Ayuda?

**Soporte Técnico:**
- 📧 Email: soporte@plataforma.com
- 📱 WhatsApp: +57 300 123 4567
- 💬 Chat en vivo: Disponible en la esquina inferior derecha
- 🕐 Horario: Lunes a Viernes, 8:00 AM - 6:00 PM

**Capacitación:**
- 📺 Videos tutoriales: [enlace]
- 📚 Base de conocimiento: [enlace]
- 👨‍🏫 Sesiones de entrenamiento: Solicitar por correo

**Reportar Problemas de Seguridad:**
- 🚨 Email urgente: seguridad@plataforma.com
- ⏰ Disponible 24/7 para emergencias

---

## ✅ Lista de Verificación de Configuración Inicial

Use esta lista para asegurarse de completar toda la configuración:

- [ ] Información básica de la empresa completada
- [ ] Logo corporativo cargado
- [ ] Color corporativo configurado
- [ ] Al menos 3 roles creados (Admin, Gerente, Usuario)
- [ ] Primer usuario adicional creado y probado
- [ ] Verificado que los permisos funcionan correctamente
- [ ] Explorado el panel de auditoría
- [ ] Guardados los datos de contacto de soporte

---

## 🎉 ¡Felicitaciones!

Ha completado la configuración inicial de su empresa en la plataforma. Ahora está listo para:

1. **Agregar más usuarios** de su equipo
2. **Explorar los módulos** disponibles
3. **Comenzar a gestionar** su información

**Recuerde:** Si tiene alguna duda, nuestro equipo de soporte está siempre disponible para ayudarle.

---

*Manual versión 1.0 - Última actualización: Enero 2026*
*Este documento es confidencial y de uso exclusivo para administradores autorizados.*