/**
 * Tito el Carpincho Estudiante
 * Mascota geométrica oficial de "Qué Puedo Cursar".
 * SVG puro, escalable, sin fuentes externas ni filtros.
 */
export default function TitoAvatar({ className = 'w-10 h-10', variant = 'default' }) {
  if (variant === 'empty-search') {
    // Tito buscando con lupa
    return (
      <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <ellipse cx="28" cy="27" rx="7" ry="6" fill="#8a4518" />
        <ellipse cx="28" cy="27" rx="4" ry="3.5" fill="#f5cda7" />
        <ellipse cx="72" cy="27" rx="7" ry="6" fill="#8a4518" />
        <ellipse cx="72" cy="27" rx="4" ry="3.5" fill="#f5cda7" />
        <rect x="22" y="25" width="56" height="54" rx="17" fill="#b45d24" />
        <rect x="24" y="47" width="52" height="34" rx="15" fill="#c97334" />
        <ellipse cx="50" cy="73" rx="14" ry="9" fill="#e8a56c" />
        <ellipse cx="50" cy="67" rx="5" ry="3" fill="#262422" />
        <path d="M 46 73 Q 50 75 54 73" stroke="#262422" strokeWidth="2.2" strokeLinecap="round" />
        <circle cx="35" cy="44" r="2.5" fill="#262422" />
        <circle cx="65" cy="44" r="2.5" fill="#262422" />
        <circle cx="35" cy="44" r="11" stroke="#262422" strokeWidth="3" fill="#ffffff" fillOpacity="0.2" />
        <circle cx="65" cy="44" r="11" stroke="#262422" strokeWidth="3" fill="#ffffff" fillOpacity="0.2" />
        <path d="M 46 44 L 54 44" stroke="#262422" strokeWidth="3" strokeLinecap="round" />
        {/* Lupa en mano */}
        <circle cx="76" cy="68" r="13" stroke="#ea580c" strokeWidth="3.5" fill="#fff7ed" />
        <line x1="85" y1="77" x2="95" y2="87" stroke="#ea580c" strokeWidth="4.5" strokeLinecap="round" />
      </svg>
    )
  }

  if (variant === 'relax-mate') {
    // Tito relajado tomando mate (todo al día / sin atrasos)
    return (
      <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <ellipse cx="28" cy="27" rx="7" ry="6" fill="#8a4518" />
        <ellipse cx="28" cy="27" rx="4" ry="3.5" fill="#f5cda7" />
        <ellipse cx="72" cy="27" rx="7" ry="6" fill="#8a4518" />
        <ellipse cx="72" cy="27" rx="4" ry="3.5" fill="#f5cda7" />
        <rect x="22" y="25" width="56" height="54" rx="17" fill="#b45d24" />
        <rect x="24" y="47" width="52" height="34" rx="15" fill="#c97334" />
        <ellipse cx="50" cy="73" rx="14" ry="9" fill="#e8a56c" />
        <ellipse cx="50" cy="67" rx="5" ry="3" fill="#262422" />
        {/* Sonrisa relajada */}
        <path d="M 44 72 Q 50 76 56 72" stroke="#262422" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        <circle cx="35" cy="44" r="2.5" fill="#262422" />
        <circle cx="65" cy="44" r="2.5" fill="#262422" />
        <circle cx="35" cy="44" r="11" stroke="#262422" strokeWidth="3" fill="#ffffff" fillOpacity="0.2" />
        <circle cx="65" cy="44" r="11" stroke="#262422" strokeWidth="3" fill="#ffffff" fillOpacity="0.2" />
        <path d="M 46 44 L 54 44" stroke="#262422" strokeWidth="3" strokeLinecap="round" />
        {/* Mate calabaza con bombilla */}
        <path d="M 72 82 C 72 73, 88 73, 88 82 C 88 90, 72 90, 72 82 Z" fill="#451a03" stroke="#262422" strokeWidth="2" />
        <line x1="80" y1="74" x2="86" y2="58" stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    )
  }

  // Por defecto: Tito de frente con lápiz en la oreja
  return (
    <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <ellipse cx="30" cy="27" rx="7" ry="6" fill="#8a4518" />
      <ellipse cx="30" cy="27" rx="4" ry="3.5" fill="#f5cda7" />
      <ellipse cx="70" cy="27" rx="7" ry="6" fill="#8a4518" />
      <ellipse cx="70" cy="27" rx="4" ry="3.5" fill="#f5cda7" />
      {/* Lápiz estudiante */}
      <path d="M 67 18 L 81 12 L 83 17 L 69 23 Z" fill="#f59e0b" />
      <path d="M 81 12 L 86 10 L 88 15 L 83 17 Z" fill="#0284c7" />
      <polygon points="67,18 61,21 69,23" fill="#f5deb3" />
      <polygon points="63,20 61,21 64,22" fill="#1a1916" />
      {/* Cabeza y hocico */}
      <rect x="23" y="25" width="54" height="54" rx="17" fill="#b45d24" />
      <rect x="25" y="47" width="50" height="34" rx="15" fill="#c97334" />
      <ellipse cx="50" cy="73" rx="14" ry="9" fill="#e8a56c" />
      <ellipse cx="50" cy="67" rx="5" ry="3" fill="#262422" />
      <path d="M 46 73 Q 50 75 54 73" stroke="#262422" strokeWidth="2.2" strokeLinecap="round" fill="none" />
      <circle cx="35" cy="44" r="2.5" fill="#262422" />
      <circle cx="65" cy="44" r="2.5" fill="#262422" />
      <circle cx="35" cy="44" r="11" stroke="#262422" strokeWidth="3" fill="#ffffff" fillOpacity="0.2" />
      <circle cx="65" cy="44" r="11" stroke="#262422" strokeWidth="3" fill="#ffffff" fillOpacity="0.2" />
      <path d="M 46 44 L 54 44" stroke="#262422" strokeWidth="3" strokeLinecap="round" />
      <path d="M 24 44 L 19 42" stroke="#262422" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M 76 44 L 81 42" stroke="#262422" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  )
}
