# Qué Puedo Cursar — Frontend

Planificador universitario personal en tiempo real. Construido con React 19 + Vite 8 + Tailwind CSS 4 + Lucide. Consume el backend de [QuePuedoCursarBack](https://github.com/MatiasRodriguez30/QuePuedoCursarBack) (FastAPI + WebSocket).

Estética de **fanzine risograph**: papel sulfito, tinta negra, magenta y verde lima flúo, sellos de estado y tipografías con carácter (Dela Gothic One, Archivo, Space Mono, autoalojadas). La mascota es **Tito el cobayo**, ilustrado en cinco poses para los estados vacíos y de carga. Pensada para el día a día en tablet y celular (PWA instalable, funciona sin conexión gracias al service worker).

## Desarrollo local

```bash
npm install
npm run dev
```

Para apuntar a un backend local, creá un archivo `.env.local` (queda fuera de git) con `VITE_API_URL=http://localhost:8000`.

## Secciones

- **Hoy**: qué podés cursar ya (ordenado por impacto en cascada), finales pendientes, materias en curso, agenda de hoy y mañana, y tu avance sobre las materias obligatorias.
- **Mi carrera**: malla por años con el estado de cada materia. Al tocar una ficha se resaltan sus correlativas y lo que desbloquea, y se abre una hoja de detalle para cambiar el estado (con "Deshacer").
- **Camino**: itinerario cuatrimestre a cuatrimestre, predicción de qué se desbloquea si aprobás lo que estás cursando, atajos y excepciones de correlatividad, y créditos de electivas por nivel.
- **Agenda**: calendario semanal y mensual con eventos propios e institucionales, en tiempo real. Los administradores pueden crear y editar eventos.
- **Administración** (solo administradores): materias, carreras, período académico y usuarios.

## Tests y calidad

```bash
npm run verify    # lint + tests + build; tiene que terminar en "VERIFICACION: OK"
```

Por separado: `npm run lint` (oxlint), `npm test -- --run` (vitest), `npm run build` (vite).

En GitHub, cada PR y cada push a `main` corren automáticamente (`.github/workflows/ci.yml`) lint, tests, build y búsqueda de secretos (gitleaks). La rama `main` está protegida: no se puede pushear directo ni mergear un PR si alguno de esos controles falla. Las variables locales van en `.env.local`; `.env` y `.env.*` están ignorados por git (salvo `.env.example`).
