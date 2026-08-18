# Portafolio — Brian Muñoz

Sitio personal de una sola página donde muestro mi experiencia, las tecnologías
con las que trabajo, los proyectos en los que he participado y un formulario de
contacto. Está en producción en **[bri4n.dev](https://bri4n.dev)**.

El contenido dinámico (proyectos y tecnologías) y el envío del formulario no
viven en este repositorio: se consumen desde una API externa, así que el sitio
necesita esa API para mostrarse completo.

---

## Stack

| Capa      | Tecnología                           |
| --------- | ------------------------------------ |
| UI        | React 19 + TypeScript                |
| Build     | Vite 8                               |
| Estilos   | Tailwind CSS 4 (plugin oficial Vite) |
| Animación | GSAP 3                               |
| Iconos    | Font Awesome 6 (CDN)                 |
| Tests     | Vitest 4                             |
| Linter    | ESLint 10 + typescript-eslint        |
| Gestor    | pnpm 11                              |

Tipografías (Gelasio y Fira Code) se sirven desde `public/fonts` y se precargan
en [index.html](index.html), no dependen de Google Fonts.

---

## Requisitos

- **Node.js 20+** (desarrollado con 24.1)
- **pnpm 11** — el proyecto fija la versión en el campo `packageManager`; con
  Corepack basta `corepack enable`.
- Una instancia de la API corriendo (o el sitio cargará todo menos proyectos,tecnologías y el envío del formulario).
