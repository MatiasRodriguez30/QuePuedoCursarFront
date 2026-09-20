import { useState } from 'react'
import { Lock } from 'lucide-react'
import { apiRequest } from '../lib/api'
import TitoAvatar from './TitoAvatar'

export default function ResetPasswordScreen({ token, onDone }) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [ok, setOk] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await apiRequest('/auth/reset-password', { method: 'POST', body: JSON.stringify({ token, password }) })
      setOk(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-full flex items-center justify-center p-4 bg-[#fbf9f4]">
      <div className="w-full max-w-sm notebook-panel rounded-2xl border-2 border-[#78716c] p-6 sm:p-7 shadow-xl bg-white">
        <div className="flex flex-col items-center gap-2 mb-6">
          <div className="h-14 w-14 rounded-2xl bg-orange-700 flex items-center justify-center p-1.5 shadow-sm border border-orange-800">
            <TitoAvatar className="w-full h-full" />
          </div>
          <h1 className="text-base font-bold text-[#1a1916]">Elegí tu contraseña nueva</h1>
          <p className="text-xs text-[#57534e] text-center font-medium">
            Ingresá tu nueva clave para volver a acceder a tu libreta.
          </p>
        </div>

        {ok ? (
          <div className="space-y-4">
            <p className="text-xs font-bold text-emerald-950 bg-emerald-50 border-2 border-emerald-400 rounded-xl px-3 py-2 text-center">
              ¡Contraseña actualizada con éxito! Ya podés iniciar sesión con la nueva.
            </p>
            <button
              onClick={onDone}
              className="w-full py-2.5 bg-orange-700 hover:bg-orange-800 text-white rounded-xl text-xs font-bold shadow-xs transition-colors min-h-[44px]"
            >
              Ir a iniciar sesión
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label htmlFor="reset-password" className="block text-xs font-bold text-[#1a1916] mb-1.5">
                Contraseña nueva
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#78716c] absolute left-3 top-1/2 -translate-y-1/2" aria-hidden="true" />
                <input
                  id="reset-password"
                  type="password"
                  required
                  minLength={6}
                  autoFocus
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Al menos 6 caracteres"
                  className="w-full bg-[#fbf9f4] border-2 border-[#78716c] rounded-xl pl-9 pr-3 py-2 text-xs text-[#1a1916] placeholder-[#78716c] focus:outline-none focus:border-orange-600 focus:bg-white min-h-[44px]"
                />
              </div>
            </div>

            {error && (
              <p className="text-xs text-rose-900 bg-rose-50 border-2 border-rose-300 rounded-xl px-3 py-2 font-medium">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-orange-700 hover:bg-orange-800 text-white rounded-xl text-xs font-bold shadow-xs transition-colors min-h-[44px] disabled:opacity-60"
            >
              {loading ? 'Un momento...' : 'Guardar contraseña'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
