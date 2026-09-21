import { useState } from 'react'
import { AlertCircle, CheckCircle2, Lock } from 'lucide-react'
import { apiRequest } from '../lib/api'
import TitoFavicon from '/favicon.svg'

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
    <div className="min-h-full flex items-center justify-center p-4 bg-[#f4f0e6] bg-riso-halftone">
      <div className="w-full max-w-sm bg-white border-3 border-[#111111] p-6 sm:p-7 shadow-[6px_6px_0px_#111111] relative">
        {/* Riso registration badge */}
        <div className="absolute -top-3.5 right-4 bg-[#ff1464] text-[#111111] border-2 border-[#111111] text-[10px] font-mono font-bold uppercase px-2 py-0.5 shadow-[2px_2px_0px_#111111] rotate-1">
          RECUPERACIÓN
        </div>

        <div className="flex flex-col items-center gap-2 mb-6">
          <div className="w-14 h-14 bg-[#ccff00] border-2 border-[#111111] shadow-[3px_3px_0px_#111111] p-1 flex items-center justify-center -rotate-2">
            <img src={TitoFavicon} alt="Tito el cobayo" className="w-full h-full" width={48} height={48} />
          </div>
          <h1 className="font-display text-base font-bold uppercase text-[#111111] text-center mt-1">
            Elegí tu contraseña
          </h1>
          <p className="text-xs font-mono text-[#52525b] text-center">
            Ingresá tu nueva clave para volver a acceder a tu libreta de cursada.
          </p>
        </div>

        {ok ? (
          <div className="space-y-4">
            <div className="p-3 bg-[#ccff00] border-2 border-[#111111] shadow-[2px_2px_0px_#111111] flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#111111] shrink-0 mt-0.5" aria-hidden="true" />
              <p className="text-xs font-mono font-bold text-[#111111] leading-tight">
                ¡Contraseña actualizada con éxito! Ya podés iniciar sesión con la nueva.
              </p>
            </div>
            <button
              type="button"
              onClick={onDone}
              className="w-full py-2.5 bg-[#111111] text-[#ccff00] border-2 border-[#111111] shadow-[3px_3px_0px_#ff1464] text-xs font-mono font-bold uppercase hover:bg-black active:translate-x-0.5 active:translate-y-0.5 cursor-pointer min-h-[44px]"
            >
              Ir a iniciar sesión
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="reset-password" className="block text-xs font-mono font-bold uppercase text-[#111111] mb-1">
                Contraseña nueva
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#71717a] absolute left-3 top-1/2 -translate-y-1/2" aria-hidden="true" />
                <input
                  id="reset-password"
                  type="password"
                  required
                  minLength={6}
                  autoFocus
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Al menos 6 caracteres"
                  className="w-full bg-[#f4f0e6] border-2 border-[#111111] pl-9 pr-3 py-2 text-xs font-mono font-bold text-[#111111] placeholder-[#71717a] focus:outline-none focus:bg-white focus:border-[#ff1464] min-h-[44px]"
                />
              </div>
            </div>

            {error && (
              <div className="p-2.5 bg-[#fee2e2] border-2 border-[#dc2626] text-xs font-mono text-[#991b1b] flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-[#dc2626] shrink-0 mt-0.5" aria-hidden="true" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-[#ccff00] hover:bg-[#b8e600] text-[#111111] border-2 border-[#111111] shadow-[3px_3px_0px_#111111] text-xs font-mono font-bold uppercase transition-all active:translate-x-0.5 active:translate-y-0.5 cursor-pointer min-h-[44px] disabled:opacity-60"
            >
              {loading ? 'Guardando...' : 'Guardar contraseña'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
