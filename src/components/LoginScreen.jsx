import { useEffect, useRef, useState } from 'react'
import { AlertCircle, Eye, EyeOff, Lock, Mail } from 'lucide-react'
import { apiRequest } from '../lib/api'
import TitoFavicon from '/favicon.svg'

function passwordStrength(pwd) {
  if (!pwd) return null
  let score = 0
  if (pwd.length >= 8) score++
  if (pwd.length >= 12) score++
  if (/[A-Z]/.test(pwd)) score++
  if (/[0-9]/.test(pwd)) score++
  if (/[^A-Za-z0-9]/.test(pwd)) score++

  if (score <= 1) return { label: 'Muy débil', color: 'bg-[#dc2626]', text: 'text-[#dc2626]', width: '20%' }
  if (score === 2) return { label: 'Débil', color: 'bg-[#ea580c]', text: 'text-[#ea580c]', width: '40%' }
  if (score === 3) return { label: 'Media', color: 'bg-[#ca8a04]', text: 'text-[#ca8a04]', width: '60%' }
  if (score === 4) return { label: 'Fuerte', color: 'bg-[#16a34a]', text: 'text-[#16a34a]', width: '85%' }
  return { label: 'Muy fuerte', color: 'bg-[#15803d]', text: 'text-[#15803d]', width: '100%' }
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
    <div className="min-h-full flex items-center justify-center p-4 bg-[#f4f0e6]">
      <div className="w-full max-w-sm bg-white border-3 border-[#111111] shadow-fanzine-md p-6 sm:p-7">
        <div className="flex flex-col items-center gap-2 mb-6">
          <div className="w-16 h-16 bg-[#ccff00] border-2 border-[#111111] shadow-[3px_3px_0px_#111111] p-1.5 flex items-center justify-center">
            <img src={TitoFavicon} alt="Tito el cobayo" className="w-full h-full" width={48} height={48} />
          </div>
          <h1 className="font-display text-lg font-bold uppercase text-[#111111]">Qué Puedo Cursar</h1>
          <p className="text-xs font-mono text-[#52525b] text-center font-bold">{titulos[modo]}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 font-sans">
          <div>
            <label htmlFor="login-email" className="block text-xs font-mono font-bold uppercase text-[#111111] mb-1.5">
              Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#71717a] absolute left-3 top-1/2 -translate-y-1/2" aria-hidden="true" />
              <input
                id="login-email"
                ref={emailRef}
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="vos@ejemplo.com"
                autoComplete="email"
                className="w-full bg-[#f4f0e6] border-2 border-[#111111] pl-9 pr-3 py-2 text-xs font-mono font-bold text-[#111111] placeholder-[#71717a] focus:outline-none focus:bg-white min-h-[44px]"
              />
            </div>
          </div>

          {modo !== 'forgot' && (
            <div>
              <label htmlFor="login-password" className="block text-xs font-mono font-bold uppercase text-[#111111] mb-1.5">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#71717a] absolute left-3 top-1/2 -translate-y-1/2" aria-hidden="true" />
                <input
                  id="login-password"
                  type={showPwd ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Al menos 6 caracteres"
                  autoComplete={modo === 'register' ? 'new-password' : 'current-password'}
                  className="w-full bg-[#f4f0e6] border-2 border-[#111111] pl-9 pr-10 py-2 text-xs font-mono font-bold text-[#111111] placeholder-[#71717a] focus:outline-none focus:bg-white min-h-[44px]"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(v => !v)}
                  aria-label={showPwd ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#71717a] hover:text-[#111111] p-1.5 cursor-pointer"
                >
                  {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {strength && (
                <div className="mt-2 space-y-1">
                  <div className="w-full h-2 bg-[#f4f0e6] border border-[#111111] overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${strength.color}`}
                      style={{ width: strength.width }}
                    />
                  </div>
                  <p className={`text-[11px] font-mono font-bold ${strength.text}`}>
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
              className="block text-xs font-mono font-bold text-[#111111] hover:text-[#ff1464] underline cursor-pointer"
            >
              ¿Olvidaste tu contraseña?
            </button>
          )}

          {error && (
            <div
              role="alert"
              className="flex items-start gap-2 text-xs font-mono text-[#111111] bg-[#fee2e2] border-2 border-[#111111] p-2.5 font-bold"
            >
              <AlertCircle className="w-4 h-4 text-[#dc2626] flex-shrink-0 mt-0.5" aria-hidden="true" />
              <span>{error}</span>
            </div>
          )}

          {aviso && (
            <p className="text-xs font-mono text-[#111111] bg-[#f0fdf4] border-2 border-[#111111] p-2.5 font-bold">
              {aviso}
            </p>
          )}

          {!aviso && (
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-[#ccff00] hover:bg-[#b8e600] active:translate-x-0.5 active:translate-y-0.5 text-[#111111] border-2 border-[#111111] shadow-[3px_3px_0px_#111111] text-xs font-mono font-bold uppercase transition-all min-h-[44px] disabled:opacity-60 cursor-pointer"
            >
              {loading
                ? 'Un momento...'
                : { login: 'Iniciar sesión', register: 'Crear libreta', forgot: 'Mandar link' }[modo]}
            </button>
          )}
        </form>

        <div className="mt-5 pt-3 border-t-2 border-[#111111] text-center font-mono">
          {modo === 'forgot' ? (
            <button
              type="button"
              onClick={() => {
                setModo('login')
                setError('')
                setAviso('')
              }}
              className="text-xs font-bold text-[#52525b] hover:text-[#111111] underline cursor-pointer"
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
              className="text-xs font-bold text-[#52525b] hover:text-[#111111] underline cursor-pointer"
            >
              {modo === 'login' ? '¿No tenés cuenta? Registrate acá' : '¿Ya tenés cuenta? Iniciá sesión'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
