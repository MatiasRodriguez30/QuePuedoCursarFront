# Qué Puedo Cursar — Frontend

React + Vite + Tailwind CSS. Consume el backend de
[QuePuedoCursarBack](https://github.com/MatiasRodriguez30/QuePuedoCursarBack)
(FastAPI + WebSocket, corriendo en una tablet vía Cloudflare Tunnel).

## Desarrollo local

```bash
npm install
npm run dev
```

Por defecto apunta a `https://quepuedocursar.takana.online` (ver
`src/lib/api.js`). Para apuntar a otro backend (ej. uno local), copiá
`.env.example` a `.env` y cambiá `VITE_API_URL`, o simplemente abrí la app
con `?api=http://localhost:8000` una vez — queda guardado en `localStorage`
del navegador sin necesidad de rebuildear.

## Deploy en Vercel

1. Importar este repo en Vercel (detecta Vite automáticamente).
2. Opcional: configurar la variable de entorno `VITE_API_URL` en el proyecto
   de Vercel si el backend cambia de URL (ej. si se migra a un dominio fijo
   distinto). Si no se configura, usa el default hardcodeado.
3. Build command: `npm run build` (default). Output: `dist/`.

## Estructura

```
src/
  lib/
    api.js              # resolución de la URL del backend + fetch wrapper
    businessLogic.js     # toda la lógica de correlatividades/excepciones (pura)
    useAppData.js         # fetch inicial + WebSocket en tiempo real
    useToasts.js / useConfirm.js
  components/            # Header, HeroMetrics, modales, toasts
  tabs/                  # las 5 pestañas de la app
```

## Pestañas

- **¿Qué Puedo Cursar?** — qué materias podés cursar ahora, con impacto en
  cascada ("cuánto te atrasa no aprobarla") y próxima oportunidad de cursado.
- **Mis Estados** — marcar No Cursada / Cursando / Regular / Aprobada por
  materia, y reiniciar todo el avance académico.
- **Plan de Estudios** — ABM de materias y correlatividades.
- **Recomendaciones** — excepciones de correlatividad (Ordenanza 1872,
  cursado condicional) y materias con comisión compartida entre carreras.
- **Camino Óptimo** — configurar el cuatrimestre actual, predicción de qué se
  desbloquea si aprobás lo que estás cursando, y ruta sugerida de cursada.
