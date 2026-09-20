import { useEffect, useRef, useState } from 'react'
import { AlertCircle, Eye, EyeOff, Lock, Mail } from 'lucide-react'
import { apiRequest } from '../lib/api'
import TitoAvatar from './TitoAvatar'

function passwordStrength(pwd) {
  if (!pwd) return null
  let score = 0
  if (pwd.length >= 8) score++
  if (pwd.length >= 12) score++
  if (/[A-Z]/.test(pwd)) score++
  if (/[0-9]/.test(pwd)) score++
  if (/[^A-Za-z0-9]/.test(pwd)) score++

  if (score <= 1) return { label: 'Muy débil', color: 'bg-rose-600', text: 'text-rose-900', width: '20%' }
  if (score === 2) return { label: 'Débil', color: 'bg-orange-500', text: 'text-orange-900', width: '40%' }
  if (score === 3) return { label: 'Media', color: 'bg-amber-500', text: 'text-amber-900', width: '60%' }
  if (score === 4) return { label: 'Fuerte', color: 'bg-emerald-600', text: 'text-emerald-900', width: '85%' }
  return { label: 'Muy fuerte', color: 'bg-emerald-700', text: 'text-emerald-950', width: '100%' }
}

export default function LoginScreen({ onLogin, onRegister }) {
  const [modo, setModo] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [error, setError] = useState('')
  const [aviso, setAviso] = useState('')
  const [loading, setLoading] = useState(false)
  const emailRef = useRef(null)

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
        setAviso('Si ese email tiene una cuenta, te mandamos un link para restablecer la contraseña. Revisá también la carpeta de spam.')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const titulos = {
    login: 'Iniciá sesión para ver tu avance',
    register: 'Creá tu libreta de cursada',
    forgot: 'Te mandamos un link para elegir tu contraseña nueva',
  }

  const strength = modo === 'register' ? passwordStrength(password) : null

  return (
    <div className="min-h-full flex items-center justify-center p-4 bg-[#fbf9f4]">
      <div className="w-full max-w-sm notebook-panel rounded-2xl border-2 border-[#78716c] p-6 sm:p-7 shadow-xl bg-white">
        <div className="flex flex-col items-center gap-2 mb-6">
          <div className="h-14 w-14 rounded-2xl bg-orange-700 flex items-center justify-center p-1.5 shadow-sm border border-orange-800">
            <TitoAvatar className="w-full h-full" />
          </div>
          <h1 className="text-lg font-bold text-[#1a1916]">Qué Puedo Cursar</h1>
          <p className="text-xs text-[#57534e] text-center font-medium">{titulos[modo]}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label htmlFor="login-email" className="block text-xs font-bold text-[#1a1916] mb-1.5">
              Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#78716c] absolute left-3 top-1/2 -translate-y-1/2" aria-hidden="true" />
              <input
                id="login-email"
                ref={emailRef}
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="vos@ejemplo.com"
                autoComplete="email"
                className="w-full bg-[#fbf9f4] border-2 border-[#78716c] rounded-xl pl-9 pr-3 py-2 text-xs text-[#1a1916] placeholder-[#78716c] focus:outline-none focus:border-orange-600 focus:bg-white min-h-[44px]"
              />
            </div>
          </div>

          {modo !== 'forgot' && (
            <div>
              <label htmlFor="login-password" className="block text-xs font-bold text-[#1a1916] mb-1.5">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#78716c] absolute left-3 top-1/2 -translate-y-1/2" aria-hidden="true" />
                <input
                  id="login-password"
                  type={showPwd ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Al menos 6 caracteres"
                  autoComplete={modo === 'register' ? 'new-password' : 'current-password'}
                  className="w-full bg-[#fbf9f4] border-2 border-[#78716c] rounded-xl pl-9 pr-10 py-2 text-xs text-[#1a1916] placeholder-[#78716c] focus:outline-none focus:border-orange-600 focus:bg-white min-h-[44px]"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(v => !v)}
                  aria-label={showPwd ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#78716c] hover:text-[#1a1916] p-1.5"
                >
                  {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {strength && (
                <div className="mt-2 space-y-1">
                  <div className="w-full h-1.5 bg-[#e2dcce] rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${strength.color}`}
                      style={{ width: strength.width }}
                    />
                  </div>
                  <p className={`text-[11px] font-bold ${strength.text}`}>
                    Seguridad: {strength.label}
                  </p>
                </div>
              )}
            </div>
          )}

          {modo === 'login' && (
            <button
              type="button"
              onClick={() => {
                setModo('forgot')
                setError('')
                setAviso('')
              }}
              className="block text-xs font-bold text-orange-800 hover:text-orange-950 transition-colors"
            >
              ¿Olvidaste tu contraseña?
            </button>
          )}

          {error && (
            <div
              role="alert"
              className="flex items-start gap-2 text-xs text-rose-900 bg-rose-50 border-2 border-rose-300 rounded-xl px-3 py-2 font-medium"
            >
              <AlertCircle className="w-4 h-4 text-rose-700 flex-shrink-0 mt-0.5" aria-hidden="true" />
              <span>{error}</span>
            </div>
          )}

          {aviso && (
            <p className="text-xs text-emerald-950 bg-emerald-50 border-2 border-emerald-400 rounded-xl px-3 py-2 font-medium">
              {aviso}
            </p>
          )}

          {!aviso && (
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-orange-700 hover:bg-orange-800 text-white rounded-xl text-xs font-bold shadow-xs transition-colors min-h-[44px] disabled:opacity-60"
            >
              {loading
                ? 'Un momento...'
                : { login: 'Iniciar sesión', register: 'Crear libreta', forgot: 'Mandar link' }[modo]}
            </button>
          )}
        </form>

        <div className="mt-5 pt-3 border-t border-[#e2dcce] text-center">
          {modo === 'forgot' ? (
            <button
              type="button"
              onClick={() => {
                setModo('login')
                setError('')
                setAviso('')
              }}
              className="text-xs font-bold text-[#57534e] hover:text-[#1a1916] transition-colors"
            >
              Volver a iniciar sesión
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                setModo(m => (m === 'login' ? 'register' : 'login'))
                setError('')
              }}
              className="text-xs font-bold text-[#57534e] hover:text-[#1a1916] transition-colors"
            >
              {modo === 'login' ? '¿No tenés cuenta? Registrate acá' : '¿Ya tenés cuenta? Iniciá sesión'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
