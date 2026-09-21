import titoCafe from '../assets/tito/tito-cafe.webp'
import titoLupa from '../assets/tito/tito-lupa.webp'
import titoFestejo from '../assets/tito/tito-festejo.webp'
import titoMate from '../assets/tito/tito-mate.webp'
import titoUrgente from '../assets/tito/tito-urgente.webp'

const POSES = {
  cafe: titoCafe,
  default: titoCafe,
  lupa: titoLupa,
  'empty-search': titoLupa,
  festejo: titoFestejo,
  mate: titoMate,
  'relax-mate': titoMate,
  urgente: titoUrgente,
}

const ALTS = {
  cafe: 'Tito el Carpincho cansado tomando café',
  default: 'Tito el Carpincho Estudiante',
  lupa: 'Tito el Carpincho buscando con lupa',
  'empty-search': 'Tito buscando con lupa sin resultados',
  festejo: 'Tito festejando con papeles al aire',
  mate: 'Tito relajado tomando mate',
  'relax-mate': 'Tito relajado tomando mate con el termo al lado',
  urgente: 'Tito mordiendo un lápiz con alarma urgente',
}

/**
 * Componente TitoAvatar oficial de la Dirección 1 (Fanzine Risograph).
 * Consume WebPs hasheados por Vite (<= 75 KB) con loading="lazy" y dimensiones explícitas.
 */
export default function TitoAvatar({ className = 'w-10 h-10', variant = 'default', imgClassName = '' }) {
  const src = POSES[variant] || POSES.default
  const alt = ALTS[variant] || ALTS.default

  return (
    <div className={`overflow-hidden flex items-center justify-center flex-shrink-0 ${className}`}>
      <img
        src={src}
        alt={alt}
        loading="lazy"
        width={512}
        height={512}
        className={`w-full h-full object-cover select-none pointer-events-none ${imgClassName}`}
      />
    </div>
  )
}
