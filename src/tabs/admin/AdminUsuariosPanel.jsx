import { useEffect, useState } from 'react'
import { Shield, User, Users } from 'lucide-react'
import { apiRequest } from '../../lib/api'

export default function AdminUsuariosPanel({ showToast, usuarioActualId }) {
  const [usuarios, setUsuarios] = useState(null)
  const [cambiando, setCambiando] = useState(null)

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
      const actualizado = await apiRequest(`/usuarios/${usuario.id}/rol`, {
        method: 'PUT',
        body: JSON.stringify({ rol: nuevoRol }),
      })
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
        <h3 className="text-sm font-bold text-[#1a1916] flex items-center gap-2">
          <Users className="w-4 h-4 text-orange-700" />
          Usuarios Registrados
        </h3>
        <p className="text-xs text-[#57534e] mt-1">
          Cuentas registradas y permisos de administración. Sólo un ADMIN puede editar materias, correlatividades, carreras y fechas.
        </p>
      </div>

      {usuarios === null ? (
        <p className="text-xs text-[#57534e] italic py-6 text-center">Cargando usuarios...</p>
      ) : usuarios.length === 0 ? (
        <p className="text-xs text-[#57534e] italic py-6 text-center">Todavía no hay usuarios registrados.</p>
      ) : (
        <div className="space-y-2">
          {usuarios.map(u => (
            <div
              key={u.id}
              className="flex items-center justify-between gap-3 p-3 rounded-xl bg-white border border-[#e2dcce]"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="p-1.5 rounded-lg bg-[#f4efe6] text-[#44403c] flex-shrink-0">
                  {u.rol === 'ADMIN' ? (
                    <Shield className="w-4 h-4 text-orange-700" />
                  ) : (
                    <User className="w-4 h-4 text-[#78716c]" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-[#1a1916] truncate">
                    {u.email}
                    {u.id === usuarioActualId && <span className="text-[#78716c] font-normal"> (vos)</span>}
                  </p>
                  <p className="text-[11px] text-[#78716c]">
                    Registrado el {new Date(u.creado_en).toLocaleDateString('es-AR')}
                  </p>
                </div>
              </div>
              <div className="flex gap-1 bg-[#f4efe6] p-1 rounded-lg border border-[#d6cebf] flex-shrink-0">
                {['USER', 'ADMIN'].map(rol => (
                  <button
                    key={rol}
                    disabled={cambiando === u.id || (u.id === usuarioActualId && u.rol === 'ADMIN' && rol === 'USER')}
                    onClick={() => cambiarRol(u, rol)}
                    title={
                      u.id === usuarioActualId && u.rol === 'ADMIN' && rol === 'USER'
                        ? 'No podés quitarte el rol de administrador a vos mismo'
                        : undefined
                    }
                    className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed min-h-[36px] ${
                      u.rol === rol
                        ? 'bg-orange-700 text-white shadow-2xs'
                        : 'text-[#57534e] hover:text-[#1a1916]'
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
