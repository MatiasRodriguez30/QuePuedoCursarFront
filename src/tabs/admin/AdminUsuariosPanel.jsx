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
    <div className="space-y-5">
      <div className="pb-3 border-b-2 border-[#111111]">
        <h2 className="font-display text-sm sm:text-base font-bold uppercase text-[#111111] flex items-center gap-2">
          <Users className="w-4 h-4 text-[#111111]" aria-hidden="true" />
          Usuarios Registrados
        </h2>
        <p className="text-xs font-mono text-[#52525b] mt-0.5">
          Permisos de acceso. Sólo una cuenta con rol ADMIN puede modificar materias, carreras y correlatividades.
        </p>
      </div>

      {usuarios === null ? (
        <div className="p-8 text-center bg-[#f4f0e6] border-2 border-dashed border-[#111111]">
          <p className="text-xs font-mono font-bold uppercase text-[#52525b]">Cargando usuarios registrados...</p>
        </div>
      ) : usuarios.length === 0 ? (
        <div className="p-8 text-center bg-[#f4f0e6] border-2 border-dashed border-[#111111]">
          <p className="font-mono text-xs text-[#52525b]">No hay usuarios en la base de datos.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {usuarios.map(u => {
            const esPropio = u.id === usuarioActualId
            return (
              <div
                key={u.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-[#f9f6ee] border-2 border-[#111111] shadow-fanzine-sm"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="p-2 bg-white border-2 border-[#111111] text-[#111111] flex-shrink-0">
                    {u.rol === 'ADMIN' ? (
                      <Shield className="w-4 h-4 text-[#ff1464]" aria-hidden="true" />
                    ) : (
                      <User className="w-4 h-4 text-[#52525b]" aria-hidden="true" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold font-mono text-[#111111] truncate">
                      {u.email}
                      {esPropio && (
                        <span className="ml-1.5 px-1.5 py-0.2 bg-[#ccff00] text-[#111111] border border-[#111111] text-[10px] font-mono">
                          VOS
                        </span>
                      )}
                    </p>
                    <p className="text-[10px] font-mono text-[#71717a] mt-0.5">
                      Registrado: {new Date(u.creado_en).toLocaleDateString('es-AR')}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 self-end sm:self-auto flex-shrink-0">
                  <span className="text-[10px] font-mono font-bold uppercase text-[#71717a] mr-1 hidden sm:inline">
                    Rol:
                  </span>
                  {['USER', 'ADMIN'].map(rol => {
                    const active = u.rol === rol
                    const disabled = cambiando === u.id || (esPropio && u.rol === 'ADMIN' && rol === 'USER')
                    return (
                      <button
                        key={rol}
                        type="button"
                        disabled={disabled}
                        onClick={() => cambiarRol(u, rol)}
                        title={
                          esPropio && u.rol === 'ADMIN' && rol === 'USER'
                            ? 'No podés quitarte el rol de administrador a vos mismo'
                            : undefined
                        }
                        className={`px-3 py-1.5 text-xs font-mono font-bold uppercase border-2 border-[#111111] transition-all cursor-pointer min-h-[36px] disabled:opacity-40 disabled:cursor-not-allowed ${
                          active
                            ? 'bg-[#111111] text-[#ccff00] shadow-[2px_2px_0px_#ff1464]'
                            : 'bg-white text-[#111111] hover:bg-[#fff9db]'
                        }`}
                      >
                        {rol === 'ADMIN' ? 'Admin' : 'Usuario'}
                      </button>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
