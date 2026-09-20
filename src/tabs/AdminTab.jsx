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
      <div className="pb-3 border-b border-[#e2dcce]">
        <h2 className="text-base font-bold text-[#1a1916] flex items-center gap-2">
          <Settings className="w-4 h-4 text-orange-700" />
          Administración
        </h2>
        <p className="text-xs text-[#57534e]">
          Gestión de materias, carreras, período académico y usuarios del sistema.
        </p>
      </div>

      <div className="flex gap-1.5 bg-[#f4efe6] p-1.5 rounded-xl border border-[#d6cebf] w-fit overflow-x-auto max-w-full">
        {SECCIONES.map(s => {
          const Icon = s.icon
          const active = seccion === s.id
          return (
            <button
              key={s.id}
              onClick={() => setSeccion(s.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all min-h-[44px] ${
                active
                  ? 'bg-white text-orange-950 border-2 border-orange-600 shadow-2xs'
                  : 'text-[#57534e] hover:text-[#1a1916] hover:bg-white/60'
              }`}
            >
              <Icon className="w-4 h-4 text-orange-700" aria-hidden="true" />
              {s.label}
            </button>
          )
        })}
      </div>

      <div className="notebook-panel rounded-2xl border border-[#e2dcce] bg-white p-5 shadow-xs">
        {seccion === 'materias' && <AdminMateriasPanel ctx={ctx} showToast={showToast} showConfirm={showConfirm} />}
        {seccion === 'carreras' && <AdminCarrerasPanel ctx={ctx} showToast={showToast} showConfirm={showConfirm} />}
        {seccion === 'periodo' && <AdminConfigPanel ctx={ctx} showToast={showToast} setConfigApp={setConfigApp} />}
        {seccion === 'usuarios' && <AdminUsuariosPanel showToast={showToast} usuarioActualId={usuarioActualId} />}
      </div>
    </div>
  )
}
