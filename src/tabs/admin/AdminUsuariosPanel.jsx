import { useEffect, useState } from 'react'
import { Shield, User, Users } from 'lucide-react'
import { apiRequest } from '../../lib/api'

export default function AdminUsuariosPanel({ showToast, usuarioActualId }) {
  const [usuarios, setUsuarios] = useState(null) // null = cargando
  const [cambiando, setCambiando] = useState(null) // id del usuario cuyo rol se está guardando

  useEffect(() => {
    apiRequest('/usuarios')
      .then(setUsuarios)
      .catch(err => showToast('error', 'Error de Carga', 'No se pudo cargar la lista de usuarios: ' + err.message))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function cambiarRol(usuario, nuevoRol) {
    if (nuevoRol === usuario.rol) return
    setCambiando(usuario.id)
    try {
      const actualizado = await apiRequest(`/usuarios/${usuario.id}/rol`, { method: 'PUT', body: JSON.stringify({ rol: nuevoRol }) })
      setUsuarios(prev => prev.map(u => u.id === usuario.id ? actualizado : u))
      showToast('success', 'Rol Actualizado', `${usuario.email} ahora es ${nuevoRol === 'ADMIN' ? 'Administrador' : 'Usuario'}`)
    } catch (err) {
      showToast('error', 'Error', err.message)
    } finally {
      setCambiando(null)
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Users className="w-4 h-4 text-brand-400" />
          Usuarios
        </h3>
        <p className="text-xs text-slate-400 mt-1">Quién tiene cuenta en la app y qué rol tiene. Sólo un ADMIN puede editar materias, correlatividades, carreras y período actual.</p>
      </div>

      {usuarios === null ? (
        <p className="text-xs text-slate-500 italic py-6 text-center">Cargando...</p>
      ) : usuarios.length === 0 ? (
        <p className="text-xs text-slate-500 italic py-6 text-center">Todavía no hay usuarios registrados.</p>
      ) : (
        <div className="space-y-2">
          {usuarios.map(u => (
            <div key={u.id} className="flex items-center justify-between gap-3 p-3 rounded-xl bg-slate-900/80 border border-slate-800/80">
              <div className="flex items-center gap-2.5 min-w-0">
                {u.rol === 'ADMIN' ? <Shield className="w-4 h-4 text-amber-400 flex-shrink-0" /> : <User className="w-4 h-4 text-slate-500 flex-shrink-0" />}
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-white truncate">{u.email}{u.id === usuarioActualId && <span className="text-slate-500 font-normal"> (vos)</span>}</p>
                  <p className="text-[10px] text-slate-500">Registrado el {new Date(u.creado_en).toLocaleDateString('es-AR')}</p>
                </div>
              </div>
              <div className="flex gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 flex-shrink-0">
                {['USER', 'ADMIN'].map(rol => (
                  <button
                    key={rol}
                    disabled={cambiando === u.id || (u.id === usuarioActualId && u.rol === 'ADMIN' && rol === 'USER')}
                    onClick={() => cambiarRol(u, rol)}
                    title={u.id === usuarioActualId && u.rol === 'ADMIN' && rol === 'USER' ? 'No podés quitarte el rol de administrador a vos mismo' : undefined}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
                      u.rol === rol ? 'bg-brand-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {rol === 'ADMIN' ? 'Admin' : 'Usuario'}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
