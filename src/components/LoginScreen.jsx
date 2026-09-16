import { useEffect, useRef, useState } from 'react'
import { AlertCircle, Eye, EyeOff, GraduationCap, Lock, Mail } from 'lucide-react'
import { apiRequest } from '../lib/api'

/** Calcula la fortaleza de la contraseña. Devuelve { level, label, color, width } */
function passwordStrength(pwd) {
  if (!pwd) return null
  let score = 0
  if (pwd.length >= 8) score++
  if (pwd.length >= 12) score++
  if (/[A-Z]/.test(pwd)) score++
  if (/[0-9]/.test(pwd)) score++
  if (/[^A-Za-z0-9]/.test(pwd)) score++

  if (score <= 1) return { label: 'Muy débil', color: 'bg-rose-500', width: '20%' }
  if (score === 2) return { label: 'Débil', color: 'bg-orange-400', width: '40%' }
  if (score === 3) return { label: 'Media', color: 'bg-amber-400', width: '60%' }
  if (score === 4) return { label: 'Fuerte', color: 'bg-emerald-400', width: '85%' }
  return { label: 'Muy fuerte', color: 'bg-emerald-500', width: '100%' }
}

export default function LoginScreen({ onLogin, onRegister }) {
  const [modo, setModo] = useState('login') // 'login' | 'register' | 'forgot'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [error, setError] = useState('')
  const [aviso, setAviso] = useState('')
  const [loading, setLoading] = useState(false)
  const emailRef = useRef(null)

  // Auto-focus en el campo email al montar o cambiar de modo
  useEffect(() => {
    emailRef.current?.focus()
  }, [modo])

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

  const strength = modo === 'register' ? passwordStrength(password) : null

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
            <label htmlFor="login-email" className="block text-xs font-semibold text-slate-300 mb-1.5">Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" aria-hidden="true" />
              <input
                id="login-email"
                ref={emailRef}
                type="email" required value={email} onChange={e => setEmail(e.target.value)}
                placeholder="vos@ejemplo.com"
                autoComplete="email"
                className="w-full bg-slate-900 border border-slate-700/80 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-brand-500"
              />
            </div>
          </div>

          {modo !== 'forgot' && (
            <div>
              <label htmlFor="login-password" className="block text-xs font-semibold text-slate-300 mb-1.5">Contraseña</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" aria-hidden="true" />
                <input
                  id="login-password"
                  type={showPwd ? 'text' : 'password'}
                  required minLength={6}
                  value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="Al menos 6 caracteres"
                  autoComplete={modo === 'register' ? 'new-password' : 'current-password'}
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-xl pl-9 pr-9 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-brand-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(v => !v)}
                  aria-label={showPwd ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Indicador de fortaleza — solo en modo registro */}
              {strength && (
                <div className="mt-2 space-y-1">
                  <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-400 ${strength.color}`}
                      style={{ width: strength.width }}
                    />
                  </div>
                  <p className={`text-[10px] font-semibold ${strength.color.replace('bg-', 'text-')}`}>
                    Contraseña: {strength.label}
                  </p>
                </div>
              )}
            </div>
          )}

          {modo === 'login' && (
            <button type="button" onClick={() => { setModo('forgot'); setError(''); setAviso('') }} className="block text-[11px] text-slate-500 hover:text-slate-300 transition-colors">
              ¿Olvidaste tu contraseña?
            </button>
          )}

          {error && (
            <div role="alert" className="flex items-start gap-2 text-xs text-rose-400 bg-rose-500/10 border border-rose-500/30 rounded-lg px-3 py-2">
              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" aria-hidden="true" />
              <span>{error}</span>
            </div>
          )}
          {aviso && <p className="text-xs text-emerald-300 bg-emerald-500/10 border border-emerald-500/30 rounded-lg px-3 py-2">{aviso}</p>}

          {!aviso && (
            <button
              type="submit"
              disabled={loading}
              aria-disabled={loading}
              className="w-full py-2.5 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-brand-500/25 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
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
