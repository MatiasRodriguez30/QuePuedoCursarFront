import { useState } from 'react'
import { Calendar, Database, GitFork, GraduationCap, Settings, Users } from 'lucide-react'
import AdminMateriasPanel from './admin/AdminMateriasPanel'
import AdminCarrerasPanel from './admin/AdminCarrerasPanel'
import AdminConfigPanel from './admin/AdminConfigPanel'
import AdminUsuariosPanel from './admin/AdminUsuariosPanel'
import AdminDbPanel from './admin/AdminDbPanel'

const SECCIONES = [
  { id: 'materias', label: 'Materias', icon: GitFork },
  { id: 'carreras', label: 'Carreras', icon: GraduationCap },
  { id: 'periodo', label: 'Período', icon: Calendar },
  { id: 'usuarios', label: 'Usuarios', icon: Users },
  { id: 'db', label: 'Base de Datos', icon: Database },
]

export default function AdminTab({ ctx, showToast, showConfirm, setConfigApp, usuarioActualId }) {
  const [seccion, setSeccion] = useState('materias')

  return (
    <div className="space-y-5 max-w-7xl mx-auto">
      {/* Cabecera de Administración estilo Fanzine */}
      <div className="bg-white border-3 border-[#111111] p-4 sm:p-5 shadow-fanzine-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-1.5 bg-[#111111] text-[#ccff00] px-2 py-0.5 text-[10px] font-mono font-bold uppercase mb-1">
            <Settings className="w-3 h-3 text-[#ccff00]" aria-hidden="true" />
            <span>Zona Exclusiva</span>
          </div>
          <h1 className="font-display text-base sm:text-xl font-bold uppercase text-[#111111]">
            Panel de Administración
          </h1>
          <p className="text-xs font-mono text-[#52525b] mt-0.5">
            Gestión de materias, carreras, fechas de cuatrimestre y permisos de usuario.
          </p>
        </div>
      </div>

      {/* Pestañas de sección fanzine */}
      <div className="flex gap-2 overflow-x-auto pb-1 select-none">
        {SECCIONES.map(s => {
          const Icon = s.icon
          const active = seccion === s.id
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => setSeccion(s.id)}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs font-mono font-bold uppercase border-2 border-[#111111] transition-all cursor-pointer whitespace-nowrap min-h-[44px] ${
                active
                  ? 'bg-[#111111] text-[#ccff00] shadow-[3px_3px_0px_#ff1464] translate-y-0.5'
                  : 'bg-white text-[#111111] shadow-[2px_2px_0px_#111111] hover:bg-[#fff9db]'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${active ? 'text-[#ccff00]' : 'text-[#111111]'}`} aria-hidden="true" />
              <span>{s.label}</span>
            </button>
          )
        })}
      </div>

      {/* Contenedor del panel activo */}
      <div className="bg-white border-3 border-[#111111] shadow-fanzine p-4 sm:p-6">
        {seccion === 'materias' && <AdminMateriasPanel ctx={ctx} showToast={showToast} showConfirm={showConfirm} />}
        {seccion === 'carreras' && <AdminCarrerasPanel ctx={ctx} showToast={showToast} showConfirm={showConfirm} />}
        {seccion === 'periodo' && <AdminConfigPanel ctx={ctx} showToast={showToast} setConfigApp={setConfigApp} />}
        {seccion === 'usuarios' && <AdminUsuariosPanel showToast={showToast} usuarioActualId={usuarioActualId} />}
        {seccion === 'db' && <AdminDbPanel showToast={showToast} />}
      </div>
    </div>
  )
}
