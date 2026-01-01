# Guía de Gestión de Archivos y Documentos

## 🎯 Introducción

Esta guía le ayudará a comprender cómo funciona el sistema de almacenamiento de archivos de la plataforma, qué puede subir, cómo acceder a sus documentos y por qué algunas decisiones técnicas protegen su información.

---

## 📋 Índice

1. [¿Qué puedo subir a la plataforma?](#formatos)
2. [Límites y Restricciones](#limites)
3. [Cómo Subir Archivos](#subir)
4. [Cómo Acceder a sus Archivos](#acceder)
5. [Por qué los Enlaces Expiran (Seguridad)](#expiracion)
6. [Solución de Problemas](#problemas)

---

## <a name="formatos"></a>1. ¿Qué puedo subir a la plataforma?

### Tipos de Archivos Permitidos

La plataforma acepta los formatos más comunes en entornos empresariales:

#### 📄 **Documentos**
- **PDF** (.pdf) - Contratos, reportes, documentación oficial
- **Microsoft Word** (.doc, .docx) - Documentos editables
- **Microsoft Excel** (.xls, .xlsx) - Hojas de cálculo, bases de datos
- **Microsoft PowerPoint** (.ppt, .pptx) - Presentaciones

#### 🖼️ **Imágenes**
- **PNG** (.png) - Ideal para logos con transparencia
- **JPG/JPEG** (.jpg, .jpeg) - Fotografías, imágenes generales
- **SVG** (.svg) - Gráficos vectoriales (logos escalables)
- **GIF** (.gif) - Imágenes animadas (uso limitado)

#### 📊 **Otros Formatos**
- **CSV** (.csv) - Datos tabulares para importación
- **TXT** (.txt) - Archivos de texto plano
- **ZIP** (.zip) - Archivos comprimidos (se escanean antes de aceptar)

---

### ❌ Formatos NO Permitidos

Por razones de seguridad, estos formatos están **bloqueados**:

| Formato | Por qué está bloqueado |
|---------|------------------------|
| **.exe, .bat, .sh** | Archivos ejecutables que pueden contener virus |
| **.js, .vbs, .ps1** | Scripts que pueden ejecutar código malicioso |
| **.dll, .sys** | Archivos del sistema operativo |
| **Archivos sin extensión** | No se puede verificar su contenido |

**¿Necesita enviar uno de estos archivos?**
- Comprímalo en un .ZIP protegido con contraseña
- Contacte a soporte para autorización especial
- Use un servicio de transferencia externo aprobado por su empresa

---

## <a name="limites"></a>2. Límites y Restricciones

### Tamaños Máximos de Archivo

Para garantizar un rendimiento óptimo y proteger el sistema:

| Tipo de Archivo | Tamaño Máximo | Recomendación |
|-----------------|---------------|---------------|
| **Imágenes (PNG, JPG)** | 5 MB | Para logos: 2 MB máximo |
| **Documentos (PDF, Word)** | 10 MB | Si es mayor, comprímalo |
| **Hojas de Cálculo (Excel)** | 15 MB | Divida archivos muy grandes |
| **Archivos Comprimidos (ZIP)** | 25 MB | Contenido será escaneado |

**¿Qué pasa si mi archivo es más grande?**

Si intenta subir un archivo que excede el límite:

1. El sistema mostrará un mensaje: **"El archivo excede el tamaño permitido"**
2. **Opciones:**
   - Comprima el archivo (use herramientas como WinRAR o 7-Zip)
   - Divida el archivo en partes más pequeñas
   - Para archivos de gran tamaño permanente (ej: videos de capacitación), contacte a soporte para habilitar almacenamiento extendido

---

### Límite de Archivos por Módulo

Dependiendo de su plan y módulo contratado:

| Módulo | Límite de Almacenamiento | Archivos Aproximados |
|--------|--------------------------|----------------------|
| **Plan Básico** | 1 GB | ~200 PDFs o ~500 imágenes |
| **Plan Profesional** | 5 GB | ~1,000 PDFs o ~2,500 imágenes |
| **Plan Empresarial** | 20 GB | ~4,000 PDFs o ~10,000 imágenes |
| **Plan Ilimitado** | Sin límite | Consultar con soporte |

**¿Cómo ver mi uso actual?**
- Vaya a **Configuración** → **Uso de Almacenamiento**
- Verá una barra de progreso con su consumo actual

---

## <a name="subir"></a>3. Cómo Subir Archivos

### Método 1: Arrastrar y Soltar (Drag & Drop)

La forma más rápida y moderna:

1. **Navegue** al módulo donde desea subir el archivo
   - Ejemplo: **Empleados** → **Documentos del Empleado**
   
2. **Localice** el área de carga (usualmente marcada con un ícono de nube ☁️ o un área punteada)

3. **Arrastre** el archivo desde su carpeta de Windows/Mac

4. **Suelte** el archivo sobre el área indicada

5. **Espere** la confirmación visual:
   - Barra de progreso durante la carga
   - Mensaje verde: **"Archivo subido exitosamente"**
   - Vista previa del archivo (si es imagen)

---

### Método 2: Botón de Selección de Archivo

Si prefiere el método tradicional:

1. Haga clic en el botón **"Seleccionar Archivo"** o **"Cargar Documento"**

2. Se abrirá el explorador de archivos de su computadora

3. **Navegue** hasta la ubicación del archivo

4. **Seleccione** el archivo

5. Haga clic en **"Abrir"**

6. Confirme la carga haciendo clic en **"Subir"** (si aplica)

---

### ¿Qué sucede mientras se sube el archivo?

Detrás de escena, el sistema realiza estos pasos de seguridad:

```
1. RECEPCIÓN
   └─> El archivo llega al servidor

2. VALIDACIÓN
   ├─> ¿El formato está permitido? ✓
   ├─> ¿El tamaño es aceptable? ✓
   └─> ¿El nombre es válido? ✓

3. ESCANEO ANTIVIRUS (ClamAV)
   ├─> Busca virus conocidos
   ├─> Detecta malware oculto
   └─> Verifica integridad del archivo
   
4. ALMACENAMIENTO SEGURO
   ├─> Se guarda en su carpeta empresarial
   ├─> Se genera una URL de acceso temporal
   └─> Se registra en auditoría

5. CONFIRMACIÓN
   └─> Mensaje de éxito mostrado al usuario
```

**Tiempo estimado:** 2-10 segundos dependiendo del tamaño del archivo.

---

### ⚠️ Errores Comunes al Subir

| Error | Causa | Solución |
|-------|-------|----------|
| **"Formato no permitido"** | Extensión del archivo bloqueada | Convierta a PDF o comprima en ZIP |
| **"Archivo muy grande"** | Excede el límite de tamaño | Comprima o divida el archivo |
| **"Archivo rechazado por seguridad"** | El antivirus detectó una amenaza | Verifique el origen del archivo, contacte a TI |
| **"Nombre de archivo inválido"** | Contiene caracteres especiales | Use solo letras, números y guiones |
| **"Sin espacio disponible"** | Alcanzó su límite de almacenamiento | Elimine archivos antiguos o actualice su plan |

---

## <a name="acceder"></a>4. Cómo Acceder a sus Archivos

### Ubicación de Archivos por Módulo

Sus archivos están organizados según el módulo donde los subió:

#### 📁 **Archivos de Empresa**
- **Ruta:** Configuración → Gestión de Empresas → Branding
- **Contiene:** Logo corporativo, certificados, documentos legales

#### 👥 **Archivos de Empleados**
- **Ruta:** Recursos Humanos → Empleados → [Nombre del Empleado] → Documentos
- **Contiene:** Contratos, certificados, documentos personales

#### 📊 **Archivos de Nómina**
- **Ruta:** Nómina → Reportes → Documentos Generados
- **Contiene:** Desprendibles de pago, reportes de seguridad social

#### ⚙️ **Archivos de Sistema**
- **Ruta:** Configuración → Documentos del Sistema
- **Contiene:** Manuales, guías, plantillas

---

### Cómo Descargar un Archivo

1. **Navegue** hasta el archivo que desea descargar

2. **Haga clic** en el icono de descarga 📥 o en el nombre del archivo

3. **El sistema genera una URL temporal segura** (válida por 1 hora)

4. **Su navegador descarga el archivo** a su carpeta de descargas predeterminada

5. **Abra el archivo** normalmente desde su computadora

---

### Cómo Visualizar un Archivo sin Descargar

Para archivos PDF e imágenes:

1. **Haga clic** en el icono de vista previa 👁️ junto al archivo

2. **Se abrirá una ventana emergente** mostrando el contenido

3. **Puede hacer zoom, rotar o imprimir** directamente desde el visor

4. **Cierre la ventana** cuando termine

**Beneficio:** No satura su carpeta de descargas con archivos que solo necesita consultar rápidamente.

---

## <a name="expiracion"></a>5. Por qué los Enlaces Expiran (Seguridad)

### ¿Qué es una URL Temporal?

Cuando accede a un archivo, el sistema genera un **enlace de acceso único** que funciona así:

```
https://plataforma.com/private/assets/companies/12345/contracts/contrato_abc123.pdf?token=xyz789&expires=1640000000
```

**Componentes del enlace:**
- `companies/12345` → Su empresa (aislamiento)
- `contrato_abc123.pdf` → Nombre único del archivo
- `token=xyz789` → Llave de acceso temporal
- `expires=1640000000` → Fecha de expiración (1 hora)

---

### ¿Por qué expiran los enlaces?

Imagínese este escenario de riesgo:

**Sin expiración (❌ Inseguro):**
1. Usted descarga un contrato de un empleado
2. Copia el enlace de descarga
3. **1 mes después**, ese enlace sigue funcionando
4. Si alguien intercepta ese enlace, puede acceder al documento sin permiso

**Con expiración (✅ Seguro):**
1. Usted descarga un contrato
2. El enlace funciona por **1 hora**
3. Después de 1 hora, el enlace es **inválido**
4. Si alguien lo intercepta después, **no puede acceder**

---

### ¿Qué pasa cuando un enlace expira?

Si intenta acceder a un archivo después de 1 hora:

**Mensaje del sistema:**
```
⚠️ Este enlace ha expirado por seguridad.
Por favor, genere un nuevo enlace de acceso.
```

**¿Cómo generar un nuevo enlace?**
1. Regrese a la ubicación del archivo en la plataforma
2. Haga clic nuevamente en "Descargar" o "Ver"
3. El sistema generará un **nuevo enlace temporal válido**

**No es un error, es una protección.**

---

### Buenas Prácticas de Seguridad

✅ **Recomendado:**
- Descargue el archivo a su computadora si lo usará frecuentemente
- No comparta enlaces de descarga por correo o mensajería
- Use la función "Compartir Documento" dentro de la plataforma si necesita que otro usuario vea el archivo

❌ **Evite:**
- Guardar enlaces en favoritos (expirarán)
- Compartir enlaces por WhatsApp o correo personal
- Intentar "hackear" el sistema para extender la expiración

---

## <a name="problemas"></a>6. Solución de Problemas

### Problema: "No puedo subir mi archivo"

**Posibles causas y soluciones:**

| Síntoma | Causa Probable | Solución |
|---------|----------------|----------|
| Botón "Subir" deshabilitado | No ha seleccionado un archivo | Haga clic en "Seleccionar Archivo" primero |
| Mensaje "Formato no permitido" | Extensión bloqueada | Convierta a PDF o comprima en ZIP |
| Carga se detiene al 50% | Conexión a internet lenta | Espere o intente más tarde |
| Mensaje "Sin permisos" | Su rol no permite subir archivos | Contacte al administrador de su empresa |

---

### Problema: "Mi archivo fue rechazado"

Si el sistema rechaza su archivo:

**Paso 1: Verifique el mensaje exacto**
- "Archivo muy grande" → Reduzca el tamaño
- "Formato no permitido" → Cambie el formato
- "Rechazado por seguridad" → **El antivirus detectó una amenaza**

**Paso 2: Si dice "Rechazado por seguridad"**

Esto significa que ClamAV (antivirus) detectó algo sospechoso:

1. **¿De dónde viene el archivo?**
   - Si lo descargó de internet → Puede estar infectado
   - Si es de su empresa → Puede contener macros sospechosas

2. **¿Qué tipo de archivo es?**
   - Excel con macros → Deshabilite las macros y guarde como .xlsx
   - ZIP de origen desconocido → No intente subirlo

3. **¿Está seguro de que es legítimo?**
   - Escanee el archivo con su antivirus local primero
   - Contacte a soporte con el nombre del archivo para investigación

**Nunca ignore este error. Es una protección activa.**

---

### Problema: "No encuentro mi archivo"

**Pasos para localizar archivos:**

1. **Verifique el módulo correcto**
   - ¿Lo subió en "Empleados" o en "Configuración"?
   - Use la barra de búsqueda global (🔍 en la parte superior)

2. **Revise los filtros**
   - Algunos listados tienen filtros por fecha o estado
   - Asegúrese de que no esté filtrando solo "Activos"

3. **Verifique sus permisos**
   - Si su rol cambió recientemente, puede haber perdido acceso
   - Contacte al administrador para verificar

4. **Revise la auditoría**
   - Vaya a "Auditoría" → "Registro de Archivos"
   - Busque por nombre de archivo o fecha de carga

---

### Problema: "El enlace de descarga no funciona"

**Causas comunes:**

| Error del Navegador | Causa | Solución |
|---------------------|-------|----------|
| "404 Not Found" | Archivo fue eliminado | Verifique con el administrador |
| "403 Forbidden" | Enlace expirado (más de 1 hora) | Genere un nuevo enlace |
| "500 Server Error" | Problema temporal del servidor | Espere 5 minutos e intente de nuevo |
| Descarga se congela | Problema de red | Verifique su conexión a internet |

---

### Problema: "Me quedé sin espacio"

Si alcanzó el límite de almacenamiento:

**Solución Inmediata:**
1. Vaya a **Configuración** → **Uso de Almacenamiento**
2. Identifique archivos grandes o antiguos
3. Elimine archivos que ya no necesita (se moverán a la papelera por 30 días)

**Solución Permanente:**
- **Opción 1:** Actualice su plan a uno con más almacenamiento
- **Opción 2:** Archive documentos antiguos en su servidor local
- **Opción 3:** Contacte a ventas para un plan personalizado

---

## 📞 Soporte y Contacto

### ¿Necesita Ayuda con Archivos?

**Soporte Técnico:**
- 📧 Email: archivos@plataforma.com
- 📱 WhatsApp: +57 300 123 4567
- 💬 Chat en vivo: Disponible en la esquina inferior derecha

**Problemas de Seguridad (Archivos Rechazados):**
- 🚨 Email urgente: seguridad@plataforma.com
- Incluya en su reporte:
  - Nombre del archivo
  - Tamaño del archivo
  - Mensaje de error exacto
  - Captura de pantalla (si es posible)

---

## ✅ Lista de Verificación para Subir Archivos

Use esta lista cada vez que suba un archivo importante:

- [ ] El archivo está en un formato permitido (PDF, PNG, JPG, etc.)
- [ ] El tamaño del archivo es menor al límite (5-25 MB según tipo)
- [ ] El nombre del archivo no contiene caracteres especiales
- [ ] Tengo permisos para subir archivos en este módulo
- [ ] He verificado que el archivo no está corrupto
- [ ] El archivo proviene de una fuente confiable
- [ ] Tengo espacio de almacenamiento disponible

---

## 🎉 Consejos Profesionales

### Mejores Prácticas para Gestión de Archivos

1. **Nombres Descriptivos**
   - ✅ `Contrato_Juan_Perez_2024.pdf`
   - ❌ `documento1.pdf`

2. **Organización por Carpetas**
   - Use las carpetas del sistema (Empleados, Contratos, etc.)
   - No mezcle documentos de diferentes tipos

3. **Versiones de Archivos**
   - Si actualiza un documento, incluya la fecha en el nombre
   - Ejemplo: `Manual_Empleado_v2_2024-01-15.pdf`

4. **Seguridad**
   - No suba información confidencial a módulos públicos
   - Verifique siempre el origen de archivos externos

5. **Rendimiento**
   - Comprima imágenes grandes antes de subir
   - Use PDF en lugar de Word para documentos finales

---

**¿Listo para gestionar sus archivos de forma profesional?**

Recuerde: Un buen manejo de archivos no solo organiza su trabajo, sino que protege la información de su empresa.

---

*Guía versión 1.0 - Última actualización: Enero 2026*
*Este documento es complementario al Manual de Bienvenida para Administradores.*