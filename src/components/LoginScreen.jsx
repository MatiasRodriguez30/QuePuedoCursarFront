import { useState } from 'react'
import { GraduationCap, Lock, Mail } from 'lucide-react'
import { apiRequest } from '../lib/api'

export default function LoginScreen({ onLogin, onRegister }) {
  const [modo, setModo] = useState('login') // 'login' | 'register' | 'forgot'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [aviso, setAviso] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setAviso('')
    setLoading(true)
    try {
      if (modo === 'login') await onLogin(email, password)
      else if (modo === 'register') await onRegister(email, password)
      else {
        await apiRequest('/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) })
        setAviso('Si ese email tiene una cuenta, te mandamos un link para restablecer la contraseña. Revisá también spam.')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const titulos = {
    login: 'Iniciá sesión para ver tu progreso',
    register: 'Creá tu cuenta',
    forgot: 'Te mandamos un link para elegir una contraseña nueva',
  }

  return (
    <div className="min-h-full flex items-center justify-center p-4 bg-slate-950">
      <div className="w-full max-w-sm glass-panel rounded-2xl border border-slate-800/80 p-6 shadow-2xl">
        <div className="flex flex-col items-center gap-2 mb-6">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-400 p-0.5 shadow-lg shadow-brand-500/20 flex items-center justify-center">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-brand-400" />
            </div>
          </div>
          <h1 className="text-base font-bold text-white">Qué Puedo Cursar</h1>
          <p className="text-xs text-slate-400 text-center">{titulos[modo]}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email" required autoFocus value={email} onChange={e => setEmail(e.target.value)}
                placeholder="vos@ejemplo.com"
                className="w-full bg-slate-900 border border-slate-700/80 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-brand-500"
              />
            </div>
          </div>

          {modo !== 'forgot' && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Contraseña</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password" required minLength={6} value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="Al menos 6 caracteres"
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-brand-500"
                />
              </div>
            </div>
          )}

          {modo === 'login' && (
            <button type="button" onClick={() => { setModo('forgot'); setError(''); setAviso('') }} className="block text-[11px] text-slate-500 hover:text-slate-300 transition-colors">
              ¿Olvidaste tu contraseña?
            </button>
          )}

          {error && <p className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/30 rounded-lg px-3 py-2">{error}</p>}
          {aviso && <p className="text-xs text-emerald-300 bg-emerald-500/10 border border-emerald-500/30 rounded-lg px-3 py-2">{aviso}</p>}

          {!aviso && (
            <button type="submit" disabled={loading} className="w-full py-2.5 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-brand-500/25 transition-all disabled:opacity-60">
              {loading ? 'Un momento...' : { login: 'Iniciar sesión', register: 'Crear cuenta', forgot: 'Mandar link' }[modo]}
            </button>
          )}
        </form>

        {modo === 'forgot' ? (
          <button type="button" onClick={() => { setModo('login'); setError(''); setAviso('') }} className="w-full mt-4 text-xs text-slate-400 hover:text-slate-200 transition-colors">
            Volver a iniciar sesión
          </button>
        ) : (
          <button
            type="button"
            onClick={() => { setModo(m => m === 'login' ? 'register' : 'login'); setError('') }}
            className="w-full mt-4 text-xs text-slate-400 hover:text-slate-200 transition-colors"
          >
            {modo === 'login' ? '¿No tenés cuenta? Registrate' : '¿Ya tenés cuenta? Iniciá sesión'}
          </button>
        )}
      </div>
    </div>
  )
}
