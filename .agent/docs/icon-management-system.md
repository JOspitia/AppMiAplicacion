# Sistema de Gestión de Iconos Dinámicos

Este documento describe la arquitectura y el uso del sistema de iconos híbrido (SVG + Icon Fonts) implementado para garantizar una interfaz premium y flexible.

---

## 1. El Problema
Tradicionalmente, las aplicaciones SaaS están limitadas a una librería fija de fuentes (como PrimeIcons o FontAwesome). Para lograr un diseño "state-of-the-art", necesitábamos:
1. Poder usar **SVGs personalizados** directamente desde la base de datos para íconos de módulos específicos.
2. Mantener **compatibilidad** con librerías de fuentes estándar (PrimeIcons) para acciones genéricas.
3. Controlar el **estilo (colores, tamaños y animaciones)** de forma centralizada y mediante clases de CSS modernas.

## 2. Componente Core: `IconComponent` (`app-icon`)
Se creó un componente standalone ubicado en `src/app/shared/components/icon.component.ts` que actúa como un "renderizador inteligente".

### Lógica de Detección:
El componente analiza el string recibido en el input `icon`:
- **Si el string comienza con `<svg`**: Lo trata como HTML seguro (usando `DomSanitizer`) y lo renderiza como un SVG inyectado.
- **En caso contrario**: Lo trata como una clase de PrimeIcons (añadiendo el prefijo `pi-` automáticamente si el usuario solo provee el nombre).

### Ejemplo de Uso en el HTML:
```html
<app-icon 
  [icon]="item.icon" 
  svgClass="w-5 h-5 text-primary group-hover:text-indigo-600 transition-colors" 
  iconClass="text-xl text-slate-400">
</app-icon>
```

## 3. Integración con la Base de Datos y Backend
La tabla `configuration.sidebar_menu` y el campo `icon` en el DTO de módulos permiten flexibilidad total:
- **Nombres de Fuente**: Almacenar `home`, `user`, `pi-cog`.
- **Código SVG**: Almacenar el XML completo del SVG (ej: `<svg xmlns=...`).

El backend sirve estos datos a través de `DashboardService`, permitiendo que la interfaz cambie dinámicamente según la configuración de la empresa sin redespliegues del frontend.

## 4. Estándares Visuales y Aplicación
- **Consistencia en el Home**: Las tarjetas de los módulos utilizan `app-icon` con `svgClass="w-8 h-8"`.
- **Sidebar Dinámico**: Soporta tanto iconos de fuente para menús genéricos como SVGs específicos para módulos de negocio, manteniendo una alineación perfecta de 9x9 píxeles en su contenedor base.
- **Acceso Directo**: Los iconos SVG están configurados para usar `fill="currentColor"`, lo que permite que clases de Tailwind como `text-primary` controlen su color dinámicamente.

---
*Documentación integrada en el ecosistema SaaS - Antigravity AI Core.*
