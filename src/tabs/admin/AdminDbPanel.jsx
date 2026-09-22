import { useEffect, useState } from 'react'
import { ArrowLeft, ChevronLeft, ChevronRight, Database, GitFork, KeyRound, Link2, List, Lock, Table2 } from 'lucide-react'
import { apiRequest } from '../../lib/api'
import DiagramaRelacional from './DiagramaRelacional'

const FILAS_POR_PAGINA = 50

export default function AdminDbPanel({ showToast }) {
  const [tablas, setTablas] = useState(null)
  const [errorTablas, setErrorTablas] = useState(null)
  const [tablaActiva, setTablaActiva] = useState(null)
  const [vista, setVista] = useState('lista')

  useEffect(() => {
    apiRequest('/admin/db/tablas')
      .then(data => setTablas(data))
      .catch(err => setErrorTablas(err.message))
  }, [])

  if (errorTablas) {
    return (
      <div className="p-8 text-center bg-[#fee2e2] border-2 border-[#111111]">
        <p className="text-xs font-mono font-bold uppercase text-[#111111]">No se pudo cargar el esquema</p>
        <p className="text-xs font-mono text-[#52525b] mt-1">{errorTablas}</p>
      </div>
    )
  }

  if (tablaActiva) {
    const meta = tablas.find(t => t.nombre === tablaActiva)
    return (
      <TablaDetalle
        meta={meta}
        onVolver={() => setTablaActiva(null)}
        showToast={showToast}
      />
    )
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b-2 border-[#111111]">
        <div>
          <h2 className="font-display text-sm sm:text-base font-bold uppercase text-[#111111] flex items-center gap-2">
            <Database className="w-4 h-4 text-[#111111]" aria-hidden="true" />
            Base de Datos
          </h2>
          <p className="text-xs font-mono text-[#52525b] mt-0.5">
            Solo lectura: mirá tablas, columnas, relaciones y filas. No se puede editar ni borrar nada desde acá.
          </p>
        </div>
        {tablas !== null && (
          <div className="flex gap-1.5 shrink-0" role="tablist" aria-label="Vista de la base de datos">
            <button
              type="button"
              role="tab"
              aria-selected={vista === 'lista'}
              onClick={() => setVista('lista')}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-mono font-bold uppercase border-2 border-[#111111] cursor-pointer min-h-[44px] ${
                vista === 'lista' ? 'bg-[#111111] text-[#ccff00]' : 'bg-white text-[#111111] hover:bg-[#fff9db]'
              }`}
            >
              <List className="w-3.5 h-3.5" aria-hidden="true" />
              Lista
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={vista === 'diagrama'}
              onClick={() => setVista('diagrama')}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-mono font-bold uppercase border-2 border-[#111111] cursor-pointer min-h-[44px] ${
                vista === 'diagrama' ? 'bg-[#111111] text-[#ccff00]' : 'bg-white text-[#111111] hover:bg-[#fff9db]'
              }`}
            >
              <GitFork className="w-3.5 h-3.5" aria-hidden="true" />
              Diagrama
            </button>
          </div>
        )}
      </div>

      {tablas === null ? (
        <div className="p-8 text-center bg-[#f4f0e6] border-2 border-dashed border-[#111111]">
          <p className="text-xs font-mono font-bold uppercase text-[#52525b]">Cargando esquema...</p>
        </div>
      ) : vista === 'diagrama' ? (
        <DiagramaRelacional tablas={tablas} onVerTabla={setTablaActiva} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {tablas.map(t => (
            <button
              key={t.nombre}
              type="button"
              onClick={() => setTablaActiva(t.nombre)}
              className="text-left p-3.5 bg-[#f9f6ee] border-2 border-[#111111] shadow-fanzine-sm hover:bg-white hover:shadow-fanzine transition-all cursor-pointer min-h-[44px]"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="flex items-center gap-1.5 min-w-0">
                  <Table2 className="w-3.5 h-3.5 text-[#111111] shrink-0" aria-hidden="true" />
                  <span className="font-mono text-xs font-bold text-[#111111] truncate">{t.nombre}</span>
                </span>
                <span className="px-1.5 py-0.5 bg-[#111111] text-[#ccff00] text-[10px] font-mono font-bold shrink-0">
                  {t.filas}
                </span>
              </div>
              <p className="text-[10px] font-mono text-[#71717a] mt-1.5">
                {t.columnas.length} columna{t.columnas.length === 1 ? '' : 's'}
                {t.columnas.some(c => c.referencia) && (
                  <span className="ml-1.5 inline-flex items-center gap-0.5 text-[#0047ff]">
                    <Link2 className="w-2.5 h-2.5" aria-hidden="true" />
                    referencia otras tablas
                  </span>
                )}
              </p>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function TablaDetalle({ meta, onVolver, showToast }) {
  const [offset, setOffset] = useState(0)
  const [datos, setDatos] = useState(null)
  const [cargandoFilas, setCargandoFilas] = useState(true)

  useEffect(() => {
    let activo = true
    setCargandoFilas(true)
    apiRequest(`/admin/db/tablas/${meta.nombre}/filas?offset=${offset}&limit=${FILAS_POR_PAGINA}`)
      .then(data => { if (activo) setDatos(data) })
      .catch(err => { if (activo) showToast('error', 'Error de Carga', 'No se pudieron cargar las filas: ' + err.message) })
      .finally(() => { if (activo) setCargandoFilas(false) })
    return () => { activo = false }
  }, [meta.nombre, offset, showToast])

  const desde = datos ? Math.min(offset + 1, datos.total) : 0
  const hasta = datos ? Math.min(offset + FILAS_POR_PAGINA, datos.total) : 0

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b-2 border-[#111111]">
        <div>
          <button
            type="button"
            onClick={onVolver}
            className="inline-flex items-center gap-1 text-[10px] font-mono font-bold uppercase text-[#52525b] hover:text-[#111111] cursor-pointer mb-1.5"
          >
            <ArrowLeft className="w-3 h-3" aria-hidden="true" />
            Volver a las tablas
          </button>
          <h2 className="font-display text-sm sm:text-base font-bold uppercase text-[#111111] flex items-center gap-2">
            <Table2 className="w-4 h-4 text-[#111111]" aria-hidden="true" />
            {meta.nombre}
          </h2>
        </div>
        <span className="px-2 py-1 bg-[#111111] text-[#ccff00] text-[10px] font-mono font-bold uppercase w-fit">
          {meta.filas} fila{meta.filas === 1 ? '' : 's'} en total
        </span>
      </div>

      {/* Esquema: columnas, tipo, PK y a que referencian */}
      <div className="overflow-x-auto border-2 border-[#111111]">
        <table className="w-full text-[11px] font-mono">
          <thead>
            <tr className="bg-[#111111] text-[#ccff00] text-left uppercase">
              <th className="p-2 font-bold">Columna</th>
              <th className="p-2 font-bold">Tipo</th>
              <th className="p-2 font-bold">Referencia</th>
            </tr>
          </thead>
          <tbody>
            {meta.columnas.map(c => (
              <tr key={c.nombre} className="border-t border-[#e4e4e7] odd:bg-[#f9f6ee]">
                <td className="p-2 font-bold text-[#111111] whitespace-nowrap">
                  <span className="flex items-center gap-1">
                    {c.primary_key && <KeyRound className="w-3 h-3 text-[#b45309]" aria-hidden="true" titleAccess="Clave primaria" />}
                    {c.sensible && <Lock className="w-3 h-3 text-[#ff1464]" aria-hidden="true" titleAccess="Columna sensible: valor oculto" />}
                    {c.nombre}
                  </span>
                </td>
                <td className="p-2 text-[#52525b] whitespace-nowrap">{c.tipo}{!c.nullable && <span className="text-[#ff1464]"> *</span>}</td>
                <td className="p-2 text-[#0047ff] whitespace-nowrap">
                  {c.referencia ? `→ ${c.referencia.tabla}.${c.referencia.columna}` : ''}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Filas paginadas */}
      {cargandoFilas && !datos ? (
        <div className="p-8 text-center bg-[#f4f0e6] border-2 border-dashed border-[#111111]">
          <p className="text-xs font-mono font-bold uppercase text-[#52525b]">Cargando filas...</p>
        </div>
      ) : datos && datos.total === 0 ? (
        <div className="p-8 text-center bg-[#f4f0e6] border-2 border-dashed border-[#111111]">
          <p className="text-xs font-mono text-[#52525b]">Esta tabla todavía no tiene filas.</p>
        </div>
      ) : datos ? (
        <div className="space-y-2">
          <div className={`overflow-x-auto border-2 border-[#111111] ${cargandoFilas ? 'opacity-50' : ''}`}>
            <table className="w-full text-[11px] font-mono">
              <thead>
                <tr className="bg-[#f4f0e6] text-[#111111] text-left uppercase">
                  {datos.columnas.map(col => (
                    <th key={col} className="p-2 font-bold whitespace-nowrap">{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {datos.filas.map((fila, i) => (
                  <tr key={i} className="border-t border-[#e4e4e7] odd:bg-white even:bg-[#f9f6ee]">
                    {datos.columnas.map(col => (
                      <td key={col} className="p-2 text-[#111111] whitespace-nowrap max-w-[240px] truncate" title={String(fila[col] ?? '')}>
                        {fila[col] === null || fila[col] === undefined || fila[col] === ''
                          ? <span className="text-[#a1a1aa]">—</span>
                          : String(fila[col])}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between gap-2 text-[10px] font-mono font-bold uppercase text-[#52525b]">
            <span>{datos.total === 0 ? '0 filas' : `${desde}–${hasta} de ${datos.total}`}</span>
            <div className="flex gap-1.5">
              <button
                type="button"
                disabled={offset === 0}
                onClick={() => setOffset(o => Math.max(0, o - FILAS_POR_PAGINA))}
                className="flex items-center gap-1 px-2.5 py-1.5 border-2 border-[#111111] bg-white hover:bg-[#fff9db] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer min-h-[36px]"
              >
                <ChevronLeft className="w-3 h-3" aria-hidden="true" />
                Anterior
              </button>
              <button
                type="button"
                disabled={offset + FILAS_POR_PAGINA >= datos.total}
                onClick={() => setOffset(o => o + FILAS_POR_PAGINA)}
                className="flex items-center gap-1 px-2.5 py-1.5 border-2 border-[#111111] bg-white hover:bg-[#fff9db] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer min-h-[36px]"
              >
                Siguiente
                <ChevronRight className="w-3 h-3" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
