import { useState } from 'react'
import { Calendar, GitFork, GraduationCap, Settings, Users } from 'lucide-react'
import AdminMateriasPanel from './admin/AdminMateriasPanel'
import AdminCarrerasPanel from './admin/AdminCarrerasPanel'
import AdminConfigPanel from './admin/AdminConfigPanel'
import AdminUsuariosPanel from './admin/AdminUsuariosPanel'

const SECCIONES = [
  { id: 'materias', label: 'Materias', icon: GitFork },
  { id: 'carreras', label: 'Carreras', icon: GraduationCap },
  { id: 'periodo', label: 'Período', icon: Calendar },
  { id: 'usuarios', label: 'Usuarios', icon: Users },
]

export default function AdminTab({ ctx, showToast, showConfirm, setConfigApp, usuarioActualId }) {
  const [seccion, setSeccion] = useState('materias')

  return (
    <div className="space-y-6">
      <div className="pb-2 border-b border-slate-800/80">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <Settings className="w-4 h-4 text-brand-400" />
          Administración
        </h2>
        <p className="text-xs text-slate-400">Gestión de materias, carreras, período académico y usuarios — separado del panel principal.</p>
      </div>

      <div className="flex gap-1 bg-slate-900/60 p-1 rounded-xl border border-slate-800 w-fit overflow-x-auto max-w-full">
        {SECCIONES.map(s => {
          const Icon = s.icon
          const active = seccion === s.id
          return (
            <button
              key={s.id}
              onClick={() => setSeccion(s.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                active ? 'bg-brand-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className="w-3.5 h-3.5" aria-hidden="true" />
              {s.label}
            </button>
          )
        })}
      </div>

      <div className="glass-panel rounded-2xl border border-slate-800/80 p-5">
        {seccion === 'materias' && <AdminMateriasPanel ctx={ctx} showToast={showToast} showConfirm={showConfirm} />}
        {seccion === 'carreras' && <AdminCarrerasPanel ctx={ctx} showToast={showToast} showConfirm={showConfirm} />}
        {seccion === 'periodo' && <AdminConfigPanel ctx={ctx} showToast={showToast} setConfigApp={setConfigApp} />}
        {seccion === 'usuarios' && <AdminUsuariosPanel showToast={showToast} usuarioActualId={usuarioActualId} />}
      </div>
    </div>
  )
}
