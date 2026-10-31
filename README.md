# DAWA — Laboratorio 11

Laboratorio de componentes reutilizables y estilización con Next.js, TypeScript, Tailwind CSS y shadcn/ui.

## Proyectos

| Proyecto | Descripción | Ruta local |
| --- | --- | --- |
| [next-components-styling](next-components-styling/README.md) | Componentes reutilizables con CSS Modules y Tailwind CSS. | `/styling` |
| [next-shadcn-ui](next-shadcn-ui/README.md) | Dashboard de proyectos, equipo y tareas con shadcn/ui. | `/dashboard` |

Cada proyecto tiene sus propias dependencias. Para ejecutarlo, entra en su carpeta y usa:

```powershell
npm install
npm run dev
```

Abre la dirección que indique la terminal y añade la ruta correspondiente. Cada README incluye capturas reales y detalles de ejecución.

## Dashboard

Permite gestionar proyectos, miembros y tareas, consultar métricas, filtrar y paginar tareas, y simular preferencias. Los datos se mantienen en memoria y se restablecen al recargar la página.

Para Vercel, configura `next-shadcn-ui` como directorio raíz del proyecto. No se necesitan variables de entorno.

![Resumen del dashboard](next-shadcn-ui/docs/capturas/01-resumen.png)
