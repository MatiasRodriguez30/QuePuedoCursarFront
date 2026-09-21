import os
from pathlib import Path

OUT_DIR = Path("docs/wireframes-camino-agenda")
OUT_DIR.mkdir(parents=True, exist_ok=True)

# Shared CSS styles for the wireframes
FANZINE_CSS = """
@import url('https://fonts.googleapis.com/css2?family=Archivo:wght@400;600;700;900&family=Dela+Gothic+One&family=Space+Mono:ital,wght@0,400;0,700;1,400&display=swap');

:root {
  --font-display: 'Dela Gothic One', cursive;
  --font-sans: 'Archivo', sans-serif;
  --font-mono: 'Space Mono', monospace;
  --paper: #f4f0e6;
  --ink: #111111;
  --lime: #ccff00;
  --magenta: #ff1464;
  --blue: #0047ff;
}

* { box-sizing: border-box; margin: 0; padding: 0; }
body {
  background-color: var(--paper);
  color: var(--ink);
  font-family: var(--font-sans);
  background-image: radial-gradient(rgba(17, 17, 17, 0.05) 1px, transparent 1px);
  background-size: 14px 14px;
}

.font-display {
  font-family: var(--font-display);
  letter-spacing: 0.04em;
  word-spacing: 0.18em;
}

.font-mono { font-family: var(--font-mono); }

.fanzine-card {
  background: #ffffff;
  border: 2px solid var(--ink);
  box-shadow: 3px 3px 0px var(--ink);
}

.fanzine-card-sm {
  background: #ffffff;
  border: 2px solid var(--ink);
  box-shadow: 2px 2px 0px var(--ink);
}

.fanzine-badge-lime {
  background: var(--lime);
  color: var(--ink);
  border: 1px solid var(--ink);
}

.fanzine-badge-magenta {
  background: var(--magenta);
  color: var(--ink);
  border: 1px solid var(--ink);
}

.fanzine-badge-ink {
  background: var(--ink);
  color: var(--lime);
}

.fanzine-badge-blue {
  background: var(--blue);
  color: #ffffff;
  border: 1px solid var(--ink);
}

.btn-lime {
  background: var(--lime);
  color: var(--ink);
  border: 2px solid var(--ink);
  box-shadow: 2px 2px 0px var(--ink);
  font-family: var(--font-mono);
  font-weight: 700;
  text-transform: uppercase;
  cursor: pointer;
}

.btn-white {
  background: #ffffff;
  color: var(--ink);
  border: 2px solid var(--ink);
  box-shadow: 2px 2px 0px var(--ink);
  font-family: var(--font-mono);
  font-weight: 700;
  text-transform: uppercase;
  cursor: pointer;
}

/* Timeline specific */
.timeline-step {
  position: relative;
  padding-left: 24px;
  border-left: 3px solid var(--ink);
}
.timeline-step::before {
  content: '';
  position: absolute;
  left: -8px;
  top: 0px;
  width: 13px;
  height: 13px;
  background: var(--lime);
  border: 2px solid var(--ink);
}
"""

def generate_camino_desktop():
    return f"""<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <title>Wireframe CAMINO - Desktop (1280px)</title>
  <style>{FANZINE_CSS}</style>
</head>
<body style="padding: 24px; max-width: 1280px; margin: 0 auto;">
  <!-- Header / Nav bar simulado -->
  <header style="background: #f4f0e6; border-bottom: 2px solid var(--ink); padding: 12px 16px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: center;">
    <div style="display: flex; align-items: center; gap: 10px;">
      <div style="width: 36px; height: 36px; background: var(--lime); border: 2px solid var(--ink); box-shadow: 2px 2px 0px var(--ink); display: flex; align-items: center; justify-content: center;">
        <img src="../../src/assets/tito/tito-cafe.webp" style="width: 30px; height: 30px; object-fit: contain;">
      </div>
      <div>
        <h1 class="font-display" style="font-size: 16px; font-weight: 700; text-transform: uppercase;">Qué Puedo Cursar</h1>
        <span class="font-mono" style="font-size: 9px; font-weight: 700; color: #52525b; letter-spacing: 2px;">FANZINE V.03</span>
      </div>
    </div>
    <div style="display: flex; gap: 12px; align-items: center;">
      <span class="font-mono" style="font-size: 11px; font-weight: 700; background: #fff; border: 2px solid var(--ink); padding: 4px 10px; box-shadow: 2px 2px 0px var(--ink);">Ingeniería en Sistemas</span>
      <span class="font-mono" style="font-size: 10px; font-weight: 700; background: var(--lime); border: 2px solid var(--ink); padding: 4px 8px; box-shadow: 2px 2px 0px var(--ink);">● EN VIVO</span>
      <span class="font-mono" style="font-size: 11px; font-weight: 700; background: #fff; border: 2px solid var(--ink); padding: 4px 10px; box-shadow: 2px 2px 0px var(--ink);">test@ejemplo.com (Admin)</span>
    </div>
  </header>

  <div style="display: flex; gap: 24px;">
    <!-- Rail lateral -->
    <aside style="width: 200px; background: #eee8d8; border-right: 3px solid var(--ink); border: 2px solid var(--ink); padding: 16px; display: flex; flex-direction: column; gap: 10px; height: fit-content; box-shadow: 3px 3px 0px var(--ink);">
      <div class="font-mono" style="font-size: 10px; font-weight: 700; color: #71717a;">SECCIONES</div>
      <div style="padding: 10px; border: 2px solid var(--ink); font-size: 11px; font-weight: 700; font-family: var(--font-mono); background: #fff; box-shadow: 2px 2px 0px var(--ink);">HOY (5)</div>
      <div style="padding: 10px; border: 2px solid var(--ink); font-size: 11px; font-weight: 700; font-family: var(--font-mono); background: #fff; box-shadow: 2px 2px 0px var(--ink);">MI CARRERA</div>
      <div style="padding: 10px; border: 2px solid var(--ink); font-size: 11px; font-weight: 700; font-family: var(--font-mono); background: var(--ink); color: var(--lime); box-shadow: 3px 3px 0px var(--magenta);">CAMINO ★</div>
      <div style="padding: 10px; border: 2px solid var(--ink); font-size: 11px; font-weight: 700; font-family: var(--font-mono); background: #fff; box-shadow: 2px 2px 0px var(--ink);">AGENDA</div>
    </aside>

    <!-- Contenido principal Camino -->
    <main style="flex: 1; display: flex; flex-direction: column; gap: 24px;">
      <!-- Banner Cabecera Camino con Tito Lupa -->
      <div class="fanzine-card" style="padding: 20px; border-width: 3px; display: flex; justify-content: space-between; align-items: center; background: #fff;">
        <div>
          <div class="fanzine-badge-ink font-mono" style="display: inline-block; padding: 2px 8px; font-size: 10px; font-weight: 700; text-transform: uppercase; margin-bottom: 6px;">
            ITINERARIO SECUENCIAL & ATAJOS
          </div>
          <h2 class="font-display" style="font-size: 22px; text-transform: uppercase;">Camino Óptimo de Cursada</h2>
          <p class="font-mono" style="font-size: 12px; color: #52525b; margin-top: 4px;">
            Simulación período a período para completar el plan minimizando cuatrimestres perdidos por correlatividades.
          </p>
        </div>
        <div style="width: 80px; height: 80px; background: var(--lime); border: 2px solid var(--ink); box-shadow: 3px 3px 0px var(--ink); padding: 4px; display: flex; align-items: center; justify-content: center;">
          <img src="../../src/assets/tito/tito-lupa.webp" style="width: 100%; height: 100%; object-fit: contain;">
        </div>
      </div>

      <!-- SECCIÓN 1: PREDICCIÓN DE DESBLOQUEOS -->
      <section class="fanzine-card" style="padding: 20px; border-left: 6px solid var(--blue);">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px;">
          <div>
            <span class="font-mono" style="font-size: 10px; font-weight: 700; text-transform: uppercase; color: var(--blue);">★ SIMULACIÓN DE ÉXITO</span>
            <h3 class="font-display" style="font-size: 15px; text-transform: uppercase;">Predicción: Si aprobás lo que estás cursando</h3>
          </div>
          <span class="fanzine-badge-blue font-mono" style="padding: 2px 8px; font-size: 10px; font-weight: 700;">1 MATERIA EN CURSO</span>
        </div>
        <div style="display: grid; grid-cols: 2; grid-template-columns: 1fr 1fr; gap: 14px;">
          <div style="background: #f0fdf4; border: 2px solid var(--ink); padding: 12px; box-shadow: 2px 2px 0px var(--ink);">
            <div class="font-mono" style="font-size: 11px; font-weight: 700; color: #166534; margin-bottom: 6px;">✓ QUEDAN 100% HABILITADAS PARA EL PRÓXIMO CUATRI:</div>
            <div style="display: flex; flex-direction: column; gap: 6px;">
              <div style="background: #fff; border: 1px solid var(--ink); padding: 8px; font-size: 12px; font-weight: 700;">
                [6] Algoritmo y Estructura de Datos <span class="font-mono" style="font-size: 10px; color: #52525b;">(1º Año, 2º Cuat)</span>
              </div>
              <div style="background: #fff; border: 1px solid var(--ink); padding: 8px; font-size: 12px; font-weight: 700;">
                [7] Arquitectura de Computadoras <span class="font-mono" style="font-size: 10px; color: #52525b;">(1º Año, 2º Cuat)</span>
              </div>
            </div>
          </div>
          <div style="background: #eff6ff; border: 2px solid var(--ink); padding: 12px; box-shadow: 2px 2px 0px var(--ink);">
            <div class="font-mono" style="font-size: 11px; font-weight: 700; color: #1e40af; margin-bottom: 6px;">⚡ SE ACERCAN (BAJAN CORRELATIVAS PENDIENTES):</div>
            <div style="display: flex; flex-direction: column; gap: 6px;">
              <div style="background: #fff; border: 1px solid var(--ink); padding: 8px; font-size: 12px; font-weight: 700;">
                [11] Sistemas Operativos <span class="font-mono" style="font-size: 10px; color: #1e40af;">(Falta sólo rendir final de Algoritmos)</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- SECCIÓN 2: LÍNEA DE TIEMPO DEL ITINERARIO POR CUATRIMESTRE -->
      <section class="fanzine-card" style="padding: 20px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 18px; border-bottom: 2px solid var(--ink); padding-bottom: 10px;">
          <div>
            <h3 class="font-display" style="font-size: 16px; text-transform: uppercase;">Itinerario de Cursada Sugerido</h3>
            <p class="font-mono" style="font-size: 11px; color: #52525b;">Secuencia calculada período a período por impacto en cascada.</p>
          </div>
          <span class="font-mono" style="font-size: 11px; font-weight: 700; background: var(--lime); border: 2px solid var(--ink); padding: 4px 10px; box-shadow: 2px 2px 0px var(--ink);">
            Estimación: 8 Cuatrimestres restantes
          </span>
        </div>

        <div style="display: flex; flex-direction: column; gap: 20px;">
          <!-- Paso 1 -->
          <div class="timeline-step">
            <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 8px;">
              <h4 class="font-display" style="font-size: 14px; text-transform: uppercase;">1º Cuatrimestre 2026 (Actual)</h4>
              <span class="font-mono" style="font-size: 11px; font-weight: 700; background: #111; color: #fff; padding: 2px 8px;">16 hs/sem recomendadas</span>
            </div>
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px;">
              <div class="fanzine-card-sm" style="padding: 10px;">
                <div class="font-mono" style="font-size: 10px; color: #52525b;">[1] • 1º AÑO • 5 HS/SEM</div>
                <div style="font-size: 12px; font-weight: 700; margin-top: 2px;">Análisis Matemático I</div>
                <div class="fanzine-badge-magenta font-mono" style="font-size: 9px; padding: 1px 4px; display: inline-block; margin-top: 6px;">Atrasa 14 materias</div>
              </div>
              <div class="fanzine-card-sm" style="padding: 10px;">
                <div class="font-mono" style="font-size: 10px; color: #52525b;">[2] • 1º AÑO • 5 HS/SEM</div>
                <div style="font-size: 12px; font-weight: 700; margin-top: 2px;">Álgebra y Geometría Analítica</div>
                <div class="fanzine-badge-magenta font-mono" style="font-size: 9px; padding: 1px 4px; display: inline-block; margin-top: 6px;">Atrasa 10 materias</div>
              </div>
              <div class="fanzine-card-sm" style="padding: 10px;">
                <div class="font-mono" style="font-size: 10px; color: #52525b;">[5] • 1º AÑO • 3 HS/SEM</div>
                <div style="font-size: 12px; font-weight: 700; margin-top: 2px;">Lógica y Estructuras Discretas</div>
                <div class="fanzine-badge-magenta font-mono" style="font-size: 9px; padding: 1px 4px; display: inline-block; margin-top: 6px;">Atrasa 8 materias</div>
              </div>
            </div>
          </div>

          <!-- Paso 2 -->
          <div class="timeline-step">
            <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 8px;">
              <h4 class="font-display" style="font-size: 14px; text-transform: uppercase;">2º Cuatrimestre 2026</h4>
              <span class="font-mono" style="font-size: 11px; font-weight: 700; background: #111; color: #fff; padding: 2px 8px;">18 hs/sem recomendadas</span>
            </div>
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px;">
              <div class="fanzine-card-sm" style="padding: 10px;">
                <div class="font-mono" style="font-size: 10px; color: #52525b;">[6] • 1º AÑO • 5 HS/SEM</div>
                <div style="font-size: 12px; font-weight: 700; margin-top: 2px;">Algoritmo y Estructura de Datos</div>
                <div class="fanzine-badge-magenta font-mono" style="font-size: 9px; padding: 1px 4px; display: inline-block; margin-top: 6px;">Atrasa 12 materias</div>
              </div>
              <div class="fanzine-card-sm" style="padding: 10px;">
                <div class="font-mono" style="font-size: 10px; color: #52525b;">[7] • 1º AÑO • 4 HS/SEM</div>
                <div style="font-size: 12px; font-weight: 700; margin-top: 2px;">Arquitectura de Computadoras</div>
                <div class="fanzine-badge-magenta font-mono" style="font-size: 9px; padding: 1px 4px; display: inline-block; margin-top: 6px;">Atrasa 7 materias</div>
              </div>
              <div class="fanzine-card-sm" style="padding: 10px; background: #fffdf5; border-style: dashed;">
                <div class="font-mono" style="font-size: 10px; color: #b45309;">OPCIÓN CONDICIONAL</div>
                <div style="font-size: 12px; font-weight: 700; margin-top: 2px;">Física I (Comisión nocturna)</div>
                <span class="font-mono" style="font-size: 9px; color: #52525b;">Requiere excepción de cuatrimestre</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- SECCIÓN 3: ATAJOS Y EXCEPCIONES (3 BLOQUES DISTINTOS) -->
      <section class="fanzine-card" style="padding: 20px;">
        <div style="margin-bottom: 14px; border-bottom: 2px solid var(--ink); padding-bottom: 8px;">
          <div class="fanzine-badge-magenta font-mono" style="display: inline-block; padding: 2px 8px; font-size: 10px; font-weight: 700; text-transform: uppercase;">
            REGULACIONES ACADÉMICAS
          </div>
          <h3 class="font-display" style="font-size: 16px; text-transform: uppercase; margin-top: 4px;">Atajos y Excepciones del Plan</h3>
        </div>

        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px;">
          <!-- Bloque 1: Excepción de correlatividades / Adelanto de Nivel -->
          <div style="background: #f9f6ee; border: 2px solid var(--ink); padding: 14px; box-shadow: 2px 2px 0px var(--ink); display: flex; flex-direction: column; justify-content: space-between;">
            <div>
              <div class="font-mono" style="font-size: 10px; font-weight: 700; color: var(--magenta);">BLOQUE 1 • CORRELATIVAS</div>
              <h4 class="font-display" style="font-size: 12px; text-transform: uppercase; margin: 4px 0;">Adelanto de Nivel (Último Año)</h4>
              <p class="font-mono" style="font-size: 11px; color: #52525b; line-height: 1.4;">
                Permite inscribirte a materias del 5º año si adeudás menos de 30 hs semanales de niveles inferiores.
              </p>
              <div style="margin-top: 10px; padding: 8px; background: #fff; border: 1px solid var(--ink); font-size: 11px; font-family: var(--font-mono);">
                <strong>Estado:</strong> Te faltan 118 hs para activar esta excepción.
              </div>
            </div>
          </div>

          <!-- Bloque 2: Candidatos a Cursado Condicional -->
          <div style="background: #f9f6ee; border: 2px solid var(--ink); padding: 14px; box-shadow: 2px 2px 0px var(--ink); display: flex; flex-direction: column; justify-content: space-between;">
            <div>
              <div class="font-mono" style="font-size: 10px; font-weight: 700; color: #15803d;">BLOQUE 2 • CONDICIONALIDAD</div>
              <h4 class="font-display" style="font-size: 12px; text-transform: uppercase; margin: 4px 0;">Cursado Condicional (Falta 1 sola)</h4>
              <p class="font-mono" style="font-size: 11px; color: #52525b; line-height: 1.4;">
                Si estás en 4º o 5º año y te falta una única correlativa habilitante según la tabla cuatrimestral.
              </p>
              <div style="margin-top: 10px; padding: 8px; background: #fff; border: 1px solid var(--ink); font-size: 11px; font-family: var(--font-mono);">
                <strong>Candidatos:</strong> 0 materias actualmente (disponible a partir de 4º año).
              </div>
            </div>
          </div>

          <!-- Bloque 3: Materias con Comisión Compartida -->
          <div style="background: #f9f6ee; border: 2px solid var(--ink); padding: 14px; box-shadow: 2px 2px 0px var(--ink); display: flex; flex-direction: column; justify-content: space-between;">
            <div>
              <div class="font-mono" style="font-size: 10px; font-weight: 700; color: var(--blue);">BLOQUE 3 • CURSADO CRUZADO</div>
              <h4 class="font-display" style="font-size: 12px; text-transform: uppercase; margin: 4px 0;">Comisión Compartida (11 Básicas)</h4>
              <p class="font-mono" style="font-size: 11px; color: #52525b; line-height: 1.4;">
                Materias comunes con otras carreras. Podés cursarlas en otros turnos o sedes sin trámite de equivalencia.
              </p>
              <div style="margin-top: 10px; padding: 8px; background: #fff; border: 1px solid var(--ink); font-size: 10px; font-family: var(--font-mono);">
                Álgebra, Análisis I y II, Física I y II, Química, Inglés I y II, Economía, Legislación, Probabilidad.
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- SECCIÓN 4: CRÉDITOS DE ELECTIVAS POR NIVEL -->
      <section class="fanzine-card" style="padding: 20px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; border-bottom: 2px solid var(--ink); padding-bottom: 8px;">
          <div>
            <h3 class="font-display" style="font-size: 15px; text-transform: uppercase;">Bolsa de Créditos Electivas (3º a 5º Año)</h3>
            <p class="font-mono" style="font-size: 11px; color: #52525b;">Horas requeridas por nivel. Las electivas no tienen materias fijas obligatorias.</p>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px;">
          <div style="background: #fff; border: 2px solid var(--ink); padding: 12px; box-shadow: 2px 2px 0px var(--ink);">
            <div style="display: flex; justify-content: space-between; font-family: var(--font-mono); font-size: 11px; font-weight: 700;">
              <span>3º AÑO</span>
              <span>0 / 6 hs aprobadas</span>
            </div>
            <div style="width: 100%; height: 8px; background: #e4e4e7; border: 1px solid var(--ink); margin: 8px 0;">
              <div style="width: 0%; height: 100%; background: var(--lime);"></div>
            </div>
            <div class="font-mono" style="font-size: 10px; color: #52525b;">Pool: Redes Avanzadas, Gestión de Datos...</div>
          </div>

          <div style="background: #fff; border: 2px solid var(--ink); padding: 12px; box-shadow: 2px 2px 0px var(--ink);">
            <div style="display: flex; justify-content: space-between; font-family: var(--font-mono); font-size: 11px; font-weight: 700;">
              <span>4º AÑO</span>
              <span>0 / 8 hs aprobadas</span>
            </div>
            <div style="width: 100%; height: 8px; background: #e4e4e7; border: 1px solid var(--ink); margin: 8px 0;">
              <div style="width: 0%; height: 100%; background: var(--lime);"></div>
            </div>
            <div class="font-mono" style="font-size: 10px; color: #52525b;">Pool: Seguridad Ofensiva, Cloud Computing...</div>
          </div>

          <div style="background: #fff; border: 2px solid var(--ink); padding: 12px; box-shadow: 2px 2px 0px var(--ink);">
            <div style="display: flex; justify-content: space-between; font-family: var(--font-mono); font-size: 11px; font-weight: 700;">
              <span>5º AÑO</span>
              <span>0 / 10 hs aprobadas</span>
            </div>
            <div style="width: 100%; height: 8px; background: #e4e4e7; border: 1px solid var(--ink); margin: 8px 0;">
              <div style="width: 0%; height: 100%; background: var(--lime);"></div>
            </div>
            <div class="font-mono" style="font-size: 10px; color: #52525b;">Pool: Inteligencia Artificial, Robótica...</div>
          </div>
        </div>
      </section>
    </main>
  </div>
</body>
</html>"""

def generate_camino_mobile():
    return f"""<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <title>Wireframe CAMINO - Mobile (360px)</title>
  <style>{FANZINE_CSS}</style>
</head>
<body style="padding: 10px; max-width: 360px; margin: 0 auto; padding-bottom: 70px;">
  <!-- Header Mobile -->
  <header style="background: #f4f0e6; border-bottom: 2px solid var(--ink); padding: 8px 10px; margin-bottom: 12px; display: flex; justify-content: space-between; align-items: center;">
    <div style="display: flex; align-items: center; gap: 6px;">
      <div style="width: 28px; height: 28px; background: var(--lime); border: 2px solid var(--ink); display: flex; align-items: center; justify-content: center;">
        <img src="../../src/assets/tito/tito-cafe.webp" style="width: 22px; height: 22px; object-fit: contain;">
      </div>
      <span class="font-display" style="font-size: 13px; font-weight: 700;">QPC</span>
    </div>
    <div style="display: flex; gap: 6px; align-items: center;">
      <span class="font-mono" style="font-size: 10px; font-weight: 700; background: #fff; border: 2px solid var(--ink); padding: 2px 6px; max-width: 100px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">Sistemas</span>
      <span class="font-mono" style="font-size: 9px; font-weight: 700; background: var(--lime); border: 2px solid var(--ink); padding: 2px 4px;">● VIVO</span>
    </div>
  </header>

  <!-- Banner Camino -->
  <div class="fanzine-card" style="padding: 12px; margin-bottom: 12px; display: flex; justify-content: space-between; align-items: center;">
    <div>
      <span class="fanzine-badge-ink font-mono" style="font-size: 8px; padding: 1px 4px; display: inline-block;">ITINERARIO</span>
      <h2 class="font-display" style="font-size: 14px; text-transform: uppercase; margin-top: 2px;">Camino Óptimo</h2>
      <p class="font-mono" style="font-size: 10px; color: #52525b;">8 cuatrimestres restantes estimados</p>
    </div>
    <div style="width: 48px; height: 48px; background: var(--lime); border: 2px solid var(--ink); padding: 2px; display: flex; align-items: center; justify-content: center;">
      <img src="../../src/assets/tito/tito-lupa.webp" style="width: 100%; height: 100%; object-fit: contain;">
    </div>
  </div>

  <!-- Predicción Cursando Mobile -->
  <div class="fanzine-card" style="padding: 12px; border-left: 5px solid var(--blue); margin-bottom: 12px;">
    <div class="font-mono" style="font-size: 9px; font-weight: 700; color: var(--blue);">★ SI APROBÁS LO QUE CURSÁS:</div>
    <h3 class="font-display" style="font-size: 12px; text-transform: uppercase; margin-top: 2px;">Desbloqueo inmediato</h3>
    <div style="margin-top: 6px; background: #f0fdf4; border: 1px solid var(--ink); padding: 6px; font-size: 11px; font-weight: 700;">
      [6] Algoritmos y Estructuras <span class="font-mono" style="font-size: 9px; color: #166534;">(Habilitada)</span>
    </div>
  </div>

  <!-- Itinerario Línea de Tiempo Mobile -->
  <div class="fanzine-card" style="padding: 12px; margin-bottom: 12px;">
    <h3 class="font-display" style="font-size: 13px; text-transform: uppercase; margin-bottom: 8px;">Itinerario sugerido</h3>
    
    <div class="timeline-step" style="padding-left: 14px; margin-bottom: 12px;">
      <div style="font-size: 11px; font-weight: 700; font-family: var(--font-display);">1º CUAT. 2026 (ACTUAL)</div>
      <div class="font-mono" style="font-size: 9px; color: #52525b; margin-bottom: 6px;">16 hs semanales</div>
      <div style="display: flex; flex-direction: column; gap: 6px;">
        <div class="fanzine-card-sm" style="padding: 6px 8px;">
          <div style="font-size: 11px; font-weight: 700;">Análisis Matemático I</div>
          <span class="fanzine-badge-magenta font-mono" style="font-size: 8px; padding: 1px 3px;">Atrasa 14 materias</span>
        </div>
        <div class="fanzine-card-sm" style="padding: 6px 8px;">
          <div style="font-size: 11px; font-weight: 700;">Álgebra y Geometría</div>
          <span class="fanzine-badge-magenta font-mono" style="font-size: 8px; padding: 1px 3px;">Atrasa 10 materias</span>
        </div>
      </div>
    </div>

    <div class="timeline-step" style="padding-left: 14px;">
      <div style="font-size: 11px; font-weight: 700; font-family: var(--font-display);">2º CUAT. 2026</div>
      <div class="font-mono" style="font-size: 9px; color: #52525b; margin-bottom: 6px;">18 hs semanales</div>
      <div style="display: flex; flex-direction: column; gap: 6px;">
        <div class="fanzine-card-sm" style="padding: 6px 8px;">
          <div style="font-size: 11px; font-weight: 700;">Algoritmos y Estructura</div>
          <span class="fanzine-badge-magenta font-mono" style="font-size: 8px; padding: 1px 3px;">Atrasa 12 materias</span>
        </div>
      </div>
    </div>
  </div>

  <!-- Atajos y Excepciones Mobile (Acordeón o tarjetas verticales) -->
  <div class="fanzine-card" style="padding: 12px; margin-bottom: 12px;">
    <h3 class="font-display" style="font-size: 13px; text-transform: uppercase; margin-bottom: 8px;">Atajos y Excepciones</h3>
    
    <div style="display: flex; flex-direction: column; gap: 8px;">
      <div style="background: #f9f6ee; border: 1.5px solid var(--ink); padding: 8px;">
        <span class="font-mono" style="font-size: 9px; font-weight: 700; color: var(--magenta);">1. ADELANTO DE NIVEL</span>
        <div style="font-size: 11px; font-weight: 700;">Excepción último año</div>
        <div class="font-mono" style="font-size: 10px; color: #52525b; margin-top: 2px;">Faltan 118 hs para activar</div>
      </div>
      <div style="background: #f9f6ee; border: 1.5px solid var(--ink); padding: 8px;">
        <span class="font-mono" style="font-size: 9px; font-weight: 700; color: #15803d;">2. CONDICIONALIDAD</span>
        <div style="font-size: 11px; font-weight: 700;">Cursado condicional</div>
        <div class="font-mono" style="font-size: 10px; color: #52525b; margin-top: 2px;">0 candidatas ahora (aplica en 4º/5º)</div>
      </div>
      <div style="background: #f9f6ee; border: 1.5px solid var(--ink); padding: 8px;">
        <span class="font-mono" style="font-size: 9px; font-weight: 700; color: var(--blue);">3. COMISIÓN COMPARTIDA</span>
        <div style="font-size: 11px; font-weight: 700;">11 materias básicas cruzadas</div>
        <div class="font-mono" style="font-size: 10px; color: #52525b; margin-top: 2px;">Álgebra, Análisis, Física, etc.</div>
      </div>
    </div>
  </div>

  <!-- Electivas Mobile -->
  <div class="fanzine-card" style="padding: 12px;">
    <h3 class="font-display" style="font-size: 13px; text-transform: uppercase; margin-bottom: 6px;">Créditos de Electivas</h3>
    <div style="font-size: 10px; font-family: var(--font-mono); color: #52525b; margin-bottom: 8px;">0 de 24 hs totales aprobadas</div>
    <div style="display: flex; flex-direction: column; gap: 6px;">
      <div style="background: #fff; border: 1px solid var(--ink); padding: 6px; font-size: 10px; font-family: var(--font-mono);">
        <strong>3º Año:</strong> 0 / 6 hs
      </div>
      <div style="background: #fff; border: 1px solid var(--ink); padding: 6px; font-size: 10px; font-family: var(--font-mono);">
        <strong>4º Año:</strong> 0 / 8 hs
      </div>
      <div style="background: #fff; border: 1px solid var(--ink); padding: 6px; font-size: 10px; font-family: var(--font-mono);">
        <strong>5º Año:</strong> 0 / 10 hs
      </div>
    </div>
  </div>

  <!-- Barra de navegación inferior Mobile -->
  <nav style="position: fixed; bottom: 0; left: 0; right: 0; background: #fff; border-top: 2px solid var(--ink); display: flex; justify-content: space-around; padding: 8px 4px; box-shadow: 0px -2px 0px var(--ink);">
    <button class="font-mono" style="font-size: 9px; font-weight: 700; border: none; background: none;">HOY</button>
    <button class="font-mono" style="font-size: 9px; font-weight: 700; border: none; background: none;">CARRERA</button>
    <button class="font-mono" style="font-size: 9px; font-weight: 700; background: var(--ink); color: var(--lime); padding: 4px 8px;">CAMINO</button>
    <button class="font-mono" style="font-size: 9px; font-weight: 700; border: none; background: none;">AGENDA</button>
  </nav>
</body>
</html>"""

def generate_camino_states():
    return f"""<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <title>Wireframe CAMINO - Estados Vacío, Carga y Error</title>
  <style>{FANZINE_CSS}</style>
</head>
<body style="padding: 24px; max-width: 1000px; margin: 0 auto; display: flex; flex-direction: column; gap: 24px;">
  <h1 class="font-display" style="font-size: 18px; text-transform: uppercase; border-bottom: 2px solid var(--ink); padding-bottom: 6px;">
    Estados del Sistema para CAMINO (Vacío, Carga, Error)
  </h1>

  <!-- 1. Estado Vacío (Plan Completo) -->
  <div class="fanzine-card" style="padding: 30px; text-align: center;">
    <span class="fanzine-badge-ink font-mono" style="font-size: 10px; padding: 2px 8px;">ESTADO VACÍO • PLAN COMPLETADO</span>
    <div style="width: 80px; height: 80px; background: var(--lime); border: 2px solid var(--ink); box-shadow: 3px 3px 0px var(--ink); margin: 16px auto; padding: 4px;">
      <img src="../../src/assets/tito/tito-festejo.webp" style="width: 100%; height: 100%; object-fit: contain;">
    </div>
    <h2 class="font-display" style="font-size: 18px; text-transform: uppercase;">¡Misión cumplida! Todo el plan aprobado</h2>
    <p class="font-mono" style="font-size: 12px; color: #52525b; margin-top: 6px; max-width: 400px; margin-left: auto; margin-right: auto;">
      No quedan materias pendientes en el camino. Prepará el birrete y el mate para el título.
    </p>
  </div>

  <!-- 2. Estado Carga (Skeleton Fanzine) -->
  <div class="fanzine-card" style="padding: 24px;">
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px;">
      <span class="fanzine-badge-ink font-mono" style="font-size: 10px; padding: 2px 8px;">ESTADO DE CARGA (SKELETON FANZINE)</span>
    </div>
    <div style="display: flex; align-items: center; gap: 16px;">
      <div style="width: 60px; height: 60px; background: #e4e4e7; border: 2px solid var(--ink); padding: 4px;">
        <img src="../../src/assets/tito/tito-cafe.webp" style="width: 100%; height: 100%; object-fit: contain; opacity: 0.7;">
      </div>
      <div>
        <div style="width: 180px; height: 16px; background: #e4e4e7; border: 1px solid var(--ink); margin-bottom: 6px;"></div>
        <div style="width: 260px; height: 12px; background: #e4e4e7; border: 1px solid var(--ink);"></div>
      </div>
    </div>
    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-top: 16px;">
      <div style="height: 60px; background: #f4f0e6; border: 2px dashed var(--ink);"></div>
      <div style="height: 60px; background: #f4f0e6; border: 2px dashed var(--ink);"></div>
      <div style="height: 60px; background: #f4f0e6; border: 2px dashed var(--ink);"></div>
    </div>
  </div>

  <!-- 3. Estado Error con Reintento -->
  <div class="fanzine-card" style="padding: 24px; border-left: 6px solid var(--magenta);">
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
      <span class="fanzine-badge-magenta font-mono" style="font-size: 10px; padding: 2px 8px;">ESTADO DE ERROR</span>
    </div>
    <h3 class="font-display" style="font-size: 14px; text-transform: uppercase; color: #991b1b;">Error al calcular el itinerario cuatrimestral</h3>
    <p class="font-mono" style="font-size: 11px; color: #52525b; margin: 6px 0 14px 0;">
      No pudimos conectar con el backend o la carrera seleccionada no tiene materias configuradas.
    </p>
    <button class="btn-white" style="padding: 6px 14px; font-size: 11px;">Reintentar cálculo</button>
  </div>
</body>
</html>"""

def generate_agenda_desktop():
    return f"""<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <title>Wireframe AGENDA - Desktop (1280px)</title>
  <style>{FANZINE_CSS}</style>
</head>
<body style="padding: 24px; max-width: 1280px; margin: 0 auto;">
  <!-- Header simulado -->
  <header style="background: #f4f0e6; border-bottom: 2px solid var(--ink); padding: 12px 16px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: center;">
    <div style="display: flex; align-items: center; gap: 10px;">
      <div style="width: 36px; height: 36px; background: var(--lime); border: 2px solid var(--ink); box-shadow: 2px 2px 0px var(--ink); display: flex; align-items: center; justify-content: center;">
        <img src="../../src/assets/tito/tito-cafe.webp" style="width: 30px; height: 30px; object-fit: contain;">
      </div>
      <div>
        <h1 class="font-display" style="font-size: 16px; font-weight: 700; text-transform: uppercase;">Qué Puedo Cursar</h1>
        <span class="font-mono" style="font-size: 9px; font-weight: 700; color: #52525b; letter-spacing: 2px;">FANZINE V.03</span>
      </div>
    </div>
    <div style="display: flex; gap: 12px; align-items: center;">
      <span class="font-mono" style="font-size: 11px; font-weight: 700; background: #fff; border: 2px solid var(--ink); padding: 4px 10px; box-shadow: 2px 2px 0px var(--ink);">Ingeniería en Sistemas</span>
      <span class="font-mono" style="font-size: 10px; font-weight: 700; background: var(--lime); border: 2px solid var(--ink); padding: 4px 8px; box-shadow: 2px 2px 0px var(--ink);">● EN VIVO</span>
      <span class="font-mono" style="font-size: 11px; font-weight: 700; background: #fff; border: 2px solid var(--ink); padding: 4px 10px; box-shadow: 2px 2px 0px var(--ink);">test@ejemplo.com (Admin)</span>
    </div>
  </header>

  <div style="display: flex; gap: 24px;">
    <!-- Rail lateral -->
    <aside style="width: 200px; background: #eee8d8; border: 2px solid var(--ink); padding: 16px; display: flex; flex-direction: column; gap: 10px; height: fit-content; box-shadow: 3px 3px 0px var(--ink);">
      <div class="font-mono" style="font-size: 10px; font-weight: 700; color: #71717a;">SECCIONES</div>
      <div style="padding: 10px; border: 2px solid var(--ink); font-size: 11px; font-weight: 700; font-family: var(--font-mono); background: #fff; box-shadow: 2px 2px 0px var(--ink);">HOY (5)</div>
      <div style="padding: 10px; border: 2px solid var(--ink); font-size: 11px; font-weight: 700; font-family: var(--font-mono); background: #fff; box-shadow: 2px 2px 0px var(--ink);">MI CARRERA</div>
      <div style="padding: 10px; border: 2px solid var(--ink); font-size: 11px; font-weight: 700; font-family: var(--font-mono); background: #fff; box-shadow: 2px 2px 0px var(--ink);">CAMINO</div>
      <div style="padding: 10px; border: 2px solid var(--ink); font-size: 11px; font-weight: 700; font-family: var(--font-mono); background: var(--ink); color: var(--lime); box-shadow: 3px 3px 0px var(--magenta);">AGENDA ★</div>
    </aside>

    <!-- Contenido Agenda -->
    <main style="flex: 1; display: flex; flex-direction: column; gap: 20px;">
      <!-- Barra superior Agenda: selector semana/mes, alta admin -->
      <div class="fanzine-card" style="padding: 16px 20px; display: flex; justify-content: space-between; align-items: center;">
        <div style="display: flex; align-items: center; gap: 14px;">
          <h2 class="font-display" style="font-size: 18px; text-transform: uppercase;">Agenda de Cursada</h2>
          <div style="display: flex; gap: 4px; background: #f4f0e6; border: 2px solid var(--ink); padding: 2px;">
            <button class="font-mono" style="font-size: 11px; font-weight: 700; background: var(--ink); color: var(--lime); border: none; padding: 4px 10px; cursor: pointer;">
              Semana (7 días)
            </button>
            <button class="font-mono" style="font-size: 11px; font-weight: 700; background: transparent; border: none; padding: 4px 10px; cursor: pointer;">
              Mes
            </button>
          </div>
          <span class="font-mono" style="font-size: 11px; font-weight: 700; color: #52525b;">23 de Marzo - 29 de Marzo, 2026</span>
        </div>

        <!-- Botón Alta Admin -->
        <button class="btn-lime" style="padding: 8px 16px; font-size: 11px; display: flex; align-items: center; gap: 6px;">
          <span>+ Nuevo Evento (Admin)</span>
        </button>
      </div>

      <!-- Leyenda visual de eventos: propio vs importado/oficial -->
      <div style="display: flex; gap: 16px; font-family: var(--font-mono); font-size: 11px; font-weight: 700;">
        <div style="display: flex; align-items: center; gap: 6px;">
          <span style="width: 12px; height: 12px; background: var(--lime); border: 1.5px solid var(--ink); display: inline-block;"></span>
          <span>Evento Propio / Cátedra</span>
        </div>
        <div style="display: flex; align-items: center; gap: 6px;">
          <span style="width: 12px; height: 12px; background: var(--magenta); border: 1.5px solid var(--ink); display: inline-block;"></span>
          <span>Evento Oficial / Calendario Institucional</span>
        </div>
      </div>

      <!-- VISTA SEMANA DE 7 DÍAS (LUNES A DOMINGO) -->
      <div class="fanzine-card" style="padding: 16px; overflow-x: auto;">
        <div style="display: grid; grid-template-columns: repeat(7, minmax(130px, 1fr)); gap: 10px;">
          <!-- Lunes 23 -->
          <div style="background: #f9f6ee; border: 2px solid var(--ink); padding: 8px; min-height: 280px; display: flex; flex-direction: column; gap: 8px;">
            <div style="border-bottom: 2px solid var(--ink); padding-bottom: 4px; display: flex; justify-content: space-between; align-items: baseline;">
              <span class="font-display" style="font-size: 11px;">LUN 23</span>
              <span class="font-mono" style="font-size: 9px; color: #52525b;">Marzo</span>
            </div>
            <!-- Evento propio -->
            <div style="background: #fff; border: 2px solid var(--ink); box-shadow: 2px 2px 0px var(--ink); padding: 8px;">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span class="fanzine-badge-lime font-mono" style="font-size: 8px; padding: 1px 4px; font-weight: 700;">PROPIO</span>
                <span class="font-mono" style="font-size: 9px; color: #52525b;">18:00 hs</span>
              </div>
              <div style="font-size: 11px; font-weight: 700; margin-top: 4px;">Consulta Análisis Matemático I</div>
              <div class="font-mono" style="font-size: 9px; color: #71717a; margin-top: 2px;">Aula 204 • Prof. Gómez</div>
            </div>
          </div>

          <!-- Martes 24 -->
          <div style="background: #f9f6ee; border: 2px solid var(--ink); padding: 8px; min-height: 280px; display: flex; flex-direction: column; gap: 8px;">
            <div style="border-bottom: 2px solid var(--ink); padding-bottom: 4px; display: flex; justify-content: space-between; align-items: baseline;">
              <span class="font-display" style="font-size: 11px;">MAR 24</span>
              <span class="fanzine-badge-magenta font-mono" style="font-size: 8px; padding: 1px 3px;">FERIADO</span>
            </div>
            <div style="background: #fff0f5; border: 2px solid var(--ink); box-shadow: 2px 2px 0px var(--ink); padding: 8px;">
              <span class="fanzine-badge-magenta font-mono" style="font-size: 8px; padding: 1px 4px; font-weight: 700;">OFICIAL</span>
              <div style="font-size: 11px; font-weight: 700; margin-top: 4px;">Feriado Nacional Memoria</div>
              <p class="font-mono" style="font-size: 9px; color: #52525b; margin-top: 2px;">Sin actividad académica</p>
            </div>
          </div>

          <!-- Miércoles 25 -->
          <div style="background: #f9f6ee; border: 2px solid var(--ink); padding: 8px; min-height: 280px; display: flex; flex-direction: column; gap: 8px;">
            <div style="border-bottom: 2px solid var(--ink); padding-bottom: 4px; display: flex; justify-content: space-between; align-items: baseline;">
              <span class="font-display" style="font-size: 11px;">MIÉ 25</span>
              <span class="font-mono" style="font-size: 9px; color: #52525b;">Hoy</span>
            </div>
            <!-- Evento con texto largo colapsable -->
            <div style="background: #fff; border: 2px solid var(--ink); box-shadow: 2px 2px 0px var(--ink); padding: 8px;">
              <span class="fanzine-badge-lime font-mono" style="font-size: 8px; padding: 1px 4px; font-weight: 700;">PROPIO</span>
              <div style="font-size: 11px; font-weight: 700; margin-top: 4px;">Entrega TP Álgebra Vectorial</div>
              <div class="font-mono" style="font-size: 9px; color: #52525b; margin-top: 3px; line-height: 1.3;">
                Resolución de sistemas de ecuaciones lineales por eliminación gaussiana y cálculo de determinantes.
              </div>
              <button style="background: none; border: none; color: var(--blue); font-family: var(--font-mono); font-size: 9px; font-weight: 700; cursor: pointer; margin-top: 4px; text-decoration: underline;">
                [- Colapsar detalle]
              </button>
            </div>
          </div>

          <!-- Jueves 26 -->
          <div style="background: #f9f6ee; border: 2px solid var(--ink); padding: 8px; min-height: 280px;">
            <div style="border-bottom: 2px solid var(--ink); padding-bottom: 4px; display: flex; justify-content: space-between; align-items: baseline;">
              <span class="font-display" style="font-size: 11px;">JUE 26</span>
            </div>
            <div class="font-mono" style="font-size: 10px; color: #a1a1aa; margin-top: 20px; text-align: center;">Sin eventos</div>
          </div>

          <!-- Viernes 27 -->
          <div style="background: #f9f6ee; border: 2px solid var(--ink); padding: 8px; min-height: 280px; display: flex; flex-direction: column; gap: 8px;">
            <div style="border-bottom: 2px solid var(--ink); padding-bottom: 4px; display: flex; justify-content: space-between; align-items: baseline;">
              <span class="font-display" style="font-size: 11px;">VIE 27</span>
            </div>
            <div style="background: #fff; border: 2px solid var(--ink); box-shadow: 2px 2px 0px var(--ink); padding: 8px;">
              <span class="fanzine-badge-lime font-mono" style="font-size: 8px; padding: 1px 4px; font-weight: 700;">PROPIO</span>
              <div style="font-size: 11px; font-weight: 700; margin-top: 4px;">Laboratorio Lógica y Estructuras</div>
              <span class="font-mono" style="font-size: 9px; color: #52525b;">19:00 a 21:00 hs</span>
            </div>
          </div>

          <!-- Sábado 28 -->
          <div style="background: #fff; border: 2px solid var(--ink); padding: 8px; min-height: 280px; display: flex; flex-direction: column; gap: 8px;">
            <div style="border-bottom: 2px solid var(--ink); padding-bottom: 4px; display: flex; justify-content: space-between; align-items: baseline;">
              <span class="font-display" style="font-size: 11px; color: var(--magenta);">SÁB 28</span>
              <span class="font-mono" style="font-size: 9px; color: #52525b;">Fin de sem.</span>
            </div>
            <div style="background: #fff0f5; border: 2px solid var(--ink); box-shadow: 2px 2px 0px var(--ink); padding: 8px;">
              <span class="fanzine-badge-magenta font-mono" style="font-size: 8px; padding: 1px 4px; font-weight: 700;">OFICIAL</span>
              <div style="font-size: 11px; font-weight: 700; margin-top: 4px;">Turno Especial de Examen Final</div>
              <span class="font-mono" style="font-size: 9px; color: #991b1b;">09:00 hs • Bedelía Central</span>
            </div>
          </div>

          <!-- Domingo 29 -->
          <div style="background: #fff; border: 2px solid var(--ink); padding: 8px; min-height: 280px;">
            <div style="border-bottom: 2px solid var(--ink); padding-bottom: 4px; display: flex; justify-content: space-between; align-items: baseline;">
              <span class="font-display" style="font-size: 11px; color: var(--magenta);">DOM 29</span>
            </div>
            <div class="font-mono" style="font-size: 10px; color: #a1a1aa; margin-top: 20px; text-align: center;">Día libre</div>
          </div>
        </div>
      </div>
    </main>
  </div>
</body>
</html>"""

def generate_agenda_mobile():
    return f"""<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <title>Wireframe AGENDA - Mobile (360px)</title>
  <style>{FANZINE_CSS}</style>
</head>
<body style="padding: 10px; max-width: 360px; margin: 0 auto; padding-bottom: 70px;">
  <!-- Header Mobile -->
  <header style="background: #f4f0e6; border-bottom: 2px solid var(--ink); padding: 8px 10px; margin-bottom: 12px; display: flex; justify-content: space-between; align-items: center;">
    <div style="display: flex; align-items: center; gap: 6px;">
      <div style="width: 28px; height: 28px; background: var(--lime); border: 2px solid var(--ink); display: flex; align-items: center; justify-content: center;">
        <img src="../../src/assets/tito/tito-cafe.webp" style="width: 22px; height: 22px; object-fit: contain;">
      </div>
      <span class="font-display" style="font-size: 13px; font-weight: 700;">QPC</span>
    </div>
    <div style="display: flex; gap: 6px; align-items: center;">
      <span class="font-mono" style="font-size: 10px; font-weight: 700; background: #fff; border: 2px solid var(--ink); padding: 2px 6px;">Sistemas</span>
      <span class="font-mono" style="font-size: 9px; font-weight: 700; background: var(--lime); border: 2px solid var(--ink); padding: 2px 4px;">● VIVO</span>
    </div>
  </header>

  <!-- Control de Agenda Mobile: Selector de Día -->
  <div class="fanzine-card" style="padding: 12px; margin-bottom: 12px;">
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
      <h2 class="font-display" style="font-size: 14px; text-transform: uppercase;">Agenda Diaria</h2>
      <span class="font-mono" style="font-size: 10px; font-weight: 700; background: var(--ink); color: #fff; padding: 2px 6px;">Semana 12</span>
    </div>

    <!-- Carrusel de días horizontal (7 días) -->
    <div style="display: flex; gap: 4px; overflow-x: auto; padding-bottom: 4px;">
      <button style="padding: 6px 8px; border: 1.5px solid var(--ink); background: #fff; font-family: var(--font-mono); font-size: 10px; font-weight: 700;">LUN 23</button>
      <button style="padding: 6px 8px; border: 1.5px solid var(--ink); background: #fff; font-family: var(--font-mono); font-size: 10px; font-weight: 700;">MAR 24</button>
      <button style="padding: 6px 8px; border: 2px solid var(--ink); background: var(--lime); font-family: var(--font-mono); font-size: 10px; font-weight: 700; box-shadow: 2px 2px 0px var(--ink);">MIÉ 25</button>
      <button style="padding: 6px 8px; border: 1.5px solid var(--ink); background: #fff; font-family: var(--font-mono); font-size: 10px; font-weight: 700;">JUE 26</button>
      <button style="padding: 6px 8px; border: 1.5px solid var(--ink); background: #fff; font-family: var(--font-mono); font-size: 10px; font-weight: 700;">VIE 27</button>
      <button style="padding: 6px 8px; border: 1.5px solid var(--ink); background: #fff; font-family: var(--font-mono); font-size: 10px; font-weight: 700; color: var(--magenta);">SÁB 28</button>
      <button style="padding: 6px 8px; border: 1.5px solid var(--ink); background: #fff; font-family: var(--font-mono); font-size: 10px; font-weight: 700; color: var(--magenta);">DOM 29</button>
    </div>
  </div>

  <!-- Día Activo: Miércoles 25 de Marzo -->
  <div class="fanzine-card" style="padding: 12px; margin-bottom: 12px;">
    <div style="display: flex; justify-content: space-between; align-items: baseline; border-bottom: 1.5px solid var(--ink); padding-bottom: 6px; margin-bottom: 10px;">
      <span class="font-display" style="font-size: 13px;">MIÉRCOLES 25 DE MARZO</span>
      <span class="font-mono" style="font-size: 10px; font-weight: 700; color: #15803d;">2 EVENTOS</span>
    </div>

    <!-- Evento 1: Entrega TP (con expandir/colapsar) -->
    <div style="background: #fff; border: 2px solid var(--ink); box-shadow: 2px 2px 0px var(--ink); padding: 10px; margin-bottom: 10px;">
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <span class="fanzine-badge-lime font-mono" style="font-size: 8px; padding: 1px 4px; font-weight: 700;">PROPIO</span>
        <span class="font-mono" style="font-size: 9px; font-weight: 700;">17:30 hs</span>
      </div>
      <h3 style="font-size: 12px; font-weight: 700; margin-top: 4px;">Entrega TP Álgebra Vectorial</h3>
      <div class="font-mono" style="font-size: 10px; color: #52525b; margin-top: 4px; line-height: 1.3;">
        Resolución de sistemas lineales mediante eliminación gaussiana y aplicaciones en geometría euclídea tridimensional.
      </div>
      <button style="background: none; border: none; color: var(--blue); font-family: var(--font-mono); font-size: 9px; font-weight: 700; margin-top: 6px; cursor: pointer; text-decoration: underline;">
        [- Colapsar contenido]
      </button>
    </div>

    <!-- Evento 2: Consulta -->
    <div style="background: #fff; border: 2px solid var(--ink); box-shadow: 2px 2px 0px var(--ink); padding: 10px;">
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <span class="fanzine-badge-lime font-mono" style="font-size: 8px; padding: 1px 4px; font-weight: 700;">PROPIO</span>
        <span class="font-mono" style="font-size: 9px; font-weight: 700;">19:00 hs</span>
      </div>
      <h3 style="font-size: 12px; font-weight: 700; margin-top: 4px;">Clase de Consulta Análisis Matemático I</h3>
      <span class="font-mono" style="font-size: 10px; color: #71717a;">Aula 204 • Presencial</span>
    </div>
  </div>

  <!-- Vista Mes Secundaria (Mini Calendario de 4 semanas) -->
  <div class="fanzine-card" style="padding: 12px;">
    <h3 class="font-display" style="font-size: 12px; text-transform: uppercase; margin-bottom: 8px;">Vista Mes (Marzo 2026)</h3>
    <div style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 2px; text-align: center; font-family: var(--font-mono); font-size: 9px;">
      <div style="font-weight: 700;">L</div><div style="font-weight: 700;">M</div><div style="font-weight: 700;">M</div><div style="font-weight: 700;">J</div><div style="font-weight: 700;">V</div><div style="font-weight: 700; color: var(--magenta);">S</div><div style="font-weight: 700; color: var(--magenta);">D</div>
      <!-- Semana actual -->
      <div style="padding: 4px; background: #fff; border: 1px solid #ddd;">23</div>
      <div style="padding: 4px; background: #fff0f5; border: 1px solid var(--magenta); font-weight: 700;">24</div>
      <div style="padding: 4px; background: var(--lime); border: 1px solid var(--ink); font-weight: 700;">25</div>
      <div style="padding: 4px; background: #fff; border: 1px solid #ddd;">26</div>
      <div style="padding: 4px; background: #fff; border: 1px solid #ddd;">27</div>
      <div style="padding: 4px; background: #fff0f5; border: 1px solid var(--magenta); font-weight: 700;">28</div>
      <div style="padding: 4px; background: #fff; border: 1px solid #ddd;">29</div>
    </div>
  </div>

  <!-- Barra de navegación inferior Mobile -->
  <nav style="position: fixed; bottom: 0; left: 0; right: 0; background: #fff; border-top: 2px solid var(--ink); display: flex; justify-content: space-around; padding: 8px 4px; box-shadow: 0px -2px 0px var(--ink);">
    <button class="font-mono" style="font-size: 9px; font-weight: 700; border: none; background: none;">HOY</button>
    <button class="font-mono" style="font-size: 9px; font-weight: 700; border: none; background: none;">CARRERA</button>
    <button class="font-mono" style="font-size: 9px; font-weight: 700; border: none; background: none;">CAMINO</button>
    <button class="font-mono" style="font-size: 9px; font-weight: 700; background: var(--ink); color: var(--lime); padding: 4px 8px;">AGENDA</button>
  </nav>
</body>
</html>"""

def generate_agenda_states():
    return f"""<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <title>Wireframe AGENDA - Estados Vacío, Carga y Error</title>
  <style>{FANZINE_CSS}</style>
</head>
<body style="padding: 24px; max-width: 1000px; margin: 0 auto; display: flex; flex-direction: column; gap: 24px;">
  <h1 class="font-display" style="font-size: 18px; text-transform: uppercase; border-bottom: 2px solid var(--ink); padding-bottom: 6px;">
    Estados del Sistema para AGENDA (Vacío, Carga, Error)
  </h1>

  <!-- 1. Estado Vacío (Sin Eventos en el período) -->
  <div class="fanzine-card" style="padding: 30px; text-align: center;">
    <span class="fanzine-badge-ink font-mono" style="font-size: 10px; padding: 2px 8px;">ESTADO VACÍO • SIN EVENTOS</span>
    <div style="width: 80px; height: 80px; background: var(--lime); border: 2px solid var(--ink); box-shadow: 3px 3px 0px var(--ink); margin: 16px auto; padding: 4px;">
      <img src="../../src/assets/tito/tito-mate.webp" style="width: 100%; height: 100%; object-fit: contain;">
    </div>
    <h2 class="font-display" style="font-size: 18px; text-transform: uppercase;">Todo despejado por esta semana</h2>
    <p class="font-mono" style="font-size: 12px; color: #52525b; margin-top: 6px; max-width: 400px; margin-left: auto; margin-right: auto;">
      No hay parciales, entregas ni finales agendados para este rango de fechas. Momento ideal para unos mates.
    </p>
  </div>

  <!-- 2. Estado Carga (Skeleton Agenda) -->
  <div class="fanzine-card" style="padding: 24px;">
    <span class="fanzine-badge-ink font-mono" style="font-size: 10px; padding: 2px 8px; margin-bottom: 14px; display: inline-block;">
      ESTADO DE CARGA (SKELETON FANZINE)
    </span>
    <div style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 10px;">
      <div style="height: 140px; background: #f4f0e6; border: 2px dashed var(--ink); padding: 8px;">
        <div style="width: 40px; height: 12px; background: #e4e4e7; margin-bottom: 8px;"></div>
        <div style="width: 100%; height: 40px; background: #fff; border: 1px solid #ddd;"></div>
      </div>
      <div style="height: 140px; background: #f4f0e6; border: 2px dashed var(--ink); padding: 8px;">
        <div style="width: 40px; height: 12px; background: #e4e4e7; margin-bottom: 8px;"></div>
      </div>
      <div style="height: 140px; background: #f4f0e6; border: 2px dashed var(--ink); padding: 8px;">
        <div style="width: 40px; height: 12px; background: #e4e4e7; margin-bottom: 8px;"></div>
        <div style="width: 100%; height: 50px; background: #fff; border: 1px solid #ddd;"></div>
      </div>
      <div style="height: 140px; background: #f4f0e6; border: 2px dashed var(--ink); padding: 8px;"></div>
      <div style="height: 140px; background: #f4f0e6; border: 2px dashed var(--ink); padding: 8px;"></div>
      <div style="height: 140px; background: #f4f0e6; border: 2px dashed var(--ink); padding: 8px;"></div>
      <div style="height: 140px; background: #f4f0e6; border: 2px dashed var(--ink); padding: 8px;"></div>
    </div>
  </div>

  <!-- 3. Estado Error con Reintento -->
  <div class="fanzine-card" style="padding: 24px; border-left: 6px solid var(--magenta);">
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
      <span class="fanzine-badge-magenta font-mono" style="font-size: 10px; padding: 2px 8px;">ESTADO DE ERROR</span>
    </div>
    <h3 class="font-display" style="font-size: 14px; text-transform: uppercase; color: #991b1b;">No se pudo sincronizar la agenda</h3>
    <p class="font-mono" style="font-size: 11px; color: #52525b; margin: 6px 0 14px 0;">
      Hubo un problema de conexión con el servicio de calendario institucional.
    </p>
    <button class="btn-white" style="padding: 6px 14px; font-size: 11px;">Reintentar conexión</button>
  </div>
</body>
</html>"""

if __name__ == '__main__':
    (OUT_DIR / "camino_desktop_1280.html").write_text(generate_camino_desktop(), encoding="utf-8")
    (OUT_DIR / "camino_mobile_360.html").write_text(generate_camino_mobile(), encoding="utf-8")
    (OUT_DIR / "camino_empty_loading_error.html").write_text(generate_camino_states(), encoding="utf-8")
    (OUT_DIR / "agenda_desktop_1280.html").write_text(generate_agenda_desktop(), encoding="utf-8")
    (OUT_DIR / "agenda_mobile_360.html").write_text(generate_agenda_mobile(), encoding="utf-8")
    (OUT_DIR / "agenda_empty_loading_error.html").write_text(generate_agenda_states(), encoding="utf-8")
    print("All 6 HTML wireframes generated in docs/wireframes-camino-agenda/ successfully!")
