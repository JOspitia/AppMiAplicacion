# Sistema de Formulario de Compañía

Este documento detalla la arquitectura técnica, la lógica de negocio y los estándares de diseño del módulo de Gestión de Compañías (`/core/companies`). Este sistema ha sido diseñado para ser robusto, escalable y con una experiencia de usuario de nivel empresarial.

## 1. Visión General

El formulario de creación/edición de empresas utiliza un patrón de **Wizard (Asistente)** de 4 pasos para segmentar la carga cognitiva del usuario:
1.  **Identidad**: Información legal y fiscal.
2.  **Contacto**: Medios de comunicación y dominios.
3.  **Ubicación**: Geografía y estado operativo.
4.  **Branding**: Identidad visual y personalización.

## 2. Componentes de UI y UX Premium

### 2.1 Identificador de Pasos (Step Indicator)
- **Visual**: Línea de progreso con gradiente dinámico (`linear-gradient(to right, var(--primary), var(--primary-stop))`) y nodos interactivos.
- **Efectos**: Sombras proyectadas (`shadow-primary/30`) y micro-animaciones en los nodos de los pasos.
- **Estado**: Cambia de color y escala según el paso actual, completado o pendiente.

### 2.2 Motor de Branding Corporativo
- **Carga de Logo**: Implementa un área de arrastrar y soltar (Drag & Drop) con previsualización en tiempo real y desenfoque de fondo (`blur-sm`) para un efecto premium.
- **Selector de Color**: Integración de un selector hexadecimal nativo (`type="color"`) que actualiza la variable `--primary` dinámicamente en el sistema (vía `BrandingService`).

### 2.3 Sistema Geográfico en Cascada
- **Carga Secuencial**: Sigue un flujo lógico de `País -> Departamento -> Ciudad`.
- **Integración con catálogos**: Consume servicios centralizados de geografía para asegurar la integridad de los datos de ubicación.

### 2.4 Integración con AddressBuilder
- Utiliza el componente compartido `<app-address-builder>` para la estandarización de direcciones físicas, delegando la construcción compleja a un sistema de selección granular.

## 3. Lógica de Formulario e Integridad

### 3.1 FormArray para Sitios Web
- Permite la gestión dinámica de múltiples sitios web corporativos, permitiendo al usuario agregar o eliminar campos según sea necesario.

### 3.2 Gestión de Dominios
- El campo `allowedDomain` es crítico para la seguridad, ya que restringe el registro de usuarios a un dominio de correo electrónico específico (ej: `@empresa.com`).

### 3.3 Protección de Estado Operativo
- El interruptor de "Estado Operativo" está restringido a usuarios con rol `SUPER_ADMIN`, permitiendo la desactivación completa de la operación de una empresa en el SaaS.

## 4. Directorio y Gestión de Listado

La vista de administración de empresas (`CompanyListComponent`) incluye herramientas avanzadas de gestión:
- **Status Toggle**: Un interruptor de estado (`p-toggleSwitch`) permite alternar instantáneamente entre empresas **Activas** e **Inactivas**.
- **Filtrado Inteligente**: Implementado mediante `Signals` para asegurar una respuesta inmediata en el frontend.
- **Acciones Rápidas**: Acceso a edición, gestión de suscripciones y activación/desactivación sin salir de la lista.

## 4. Integración con Backend

### 4.1 Endpoints (`CompanyController`)
- `GET /api/companies/{id}`: Detalle completo de la empresa.
- `POST /api/companies`: Creación inicial.
- `PUT /api/companies/{id}`: Actualización de datos corporativos.
- `POST /api/companies/{id}/logo`: Carga binaria del logo hacia MinIO.

## 5. Estándares Visuales (Tailwind)

- **Contenedor Glassmorphism**: `bg-white/80 dark:bg-slate-900/40 backdrop-blur-3xl`.
- **Bordes Premium**: Bordes redondeados ultra-suaves (`rounded-[3.5rem]`) y sombras suaves.
- **Inputs**: Estilizados con `bg-slate-50`, bordes sutiles y estados de foco con sombras proyectadas del color de marca.

## 6. Futuro y Extensibilidad

El sistema está preparado para:
- Agregar campos personalizados por sector económico.
- Implementar validaciones de NIT/RUT específicas por país.
- Integrar mapas interactivos para geolocalización precisa.
