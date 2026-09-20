# Qué Puedo Cursar — Frontend

Libreta y planificador universitario personal en tiempo real. Construido con React 19 + Vite 8 + Tailwind CSS 4 + Lucide. Consume el backend de [QuePuedoCursarBack](https://github.com/MatiasRodriguez30/QuePuedoCursarBack) (FastAPI + WebSocket).

Diseñado con el concepto de **Cuaderno de Cursada**: una libreta de estudio ilustrada, cálida y de alta legibilidad para el día a día en tablet y celular (PWA instalable).

## Desarrollo local

```bash
npm install
npm run dev
```

Para apuntar a un backend local, copiá `.env.example` a `.env` y configurá `VITE_API_URL=http://localhost:8000`.

## Pestañas y Secciones

- **¿Qué Puedo Cursar?**: materias habilitadas según correlatividades actuales, impacto de desbloqueo y cálculo de atraso en cascada.
- **Mis Estados**: registro rápido de materias (No Cursada, Cursando, Regular, Aprobada) con recálculo instantáneo.
- **Plan de Estudios**: estructura curricular organizada por años y cuatrimestres.
- **Recomendaciones**: sugerencias de excepciones de correlatividad, cursado condicional y comisiones compartidas.
- **Camino Óptimo**: proyección cuatrimestre a cuatrimestre, simulación de materias en curso y créditos de electivas.
- **Agenda**: calendario universitario mensual con fechas clave, horarios y sincronización en tiempo real.
- **Administración**: panel para gestionar materias, carreras, período académico y permisos (solo disponible para administradores).

## Tests y Calidad

```bash
npm run lint      # oxlint
npm test -- --run # vitest
npm run build     # vite build
```
