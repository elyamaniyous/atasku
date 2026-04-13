export function AtaskuLogo({ className = '', size = 'default' }: { className?: string; size?: 'small' | 'default' | 'large' }) {
  const sizes = {
    small: { icon: 24, text: 'text-lg' },
    default: { icon: 32, text: 'text-2xl' },
    large: { icon: 48, text: 'text-4xl' },
  }
  const s = sizes[size]

  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <svg width={s.icon} height={s.icon} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Outer shield/hexagonal shape */}
        <path
          d="M24 2L42 13V35L24 46L6 35V13L24 2Z"
          fill="currentColor"
          className="text-red-600"
        />
        {/* Inner gear teeth */}
        <path
          d="M24 8L37 15.5V32.5L24 40L11 32.5V15.5L24 8Z"
          fill="white"
          fillOpacity="0.15"
        />
        {/* Wrench/tool mark */}
        <path
          d="M20 18L24 14L28 18V22L32 26L28 30V34L24 30L20 34V30L16 26L20 22V18Z"
          fill="white"
          fillOpacity="0.9"
        />
        {/* Center dot — precision */}
        <circle cx="24" cy="24" r="3" fill="currentColor" className="text-red-600" />
      </svg>
      <span className={`font-heading font-bold tracking-tight ${s.text}`}>Atasku</span>
      <span className="rounded bg-red-600 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-widest text-white leading-none">Beta</span>
    </span>
  )
}

export function AtaskuIcon({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M24 2L42 13V35L24 46L6 35V13L24 2Z" fill="#DC2626" />
      <path d="M24 8L37 15.5V32.5L24 40L11 32.5V15.5L24 8Z" fill="white" fillOpacity="0.15" />
      <path d="M20 18L24 14L28 18V22L32 26L28 30V34L24 30L20 34V30L16 26L20 22V18Z" fill="white" fillOpacity="0.9" />
      <circle cx="24" cy="24" r="3" fill="#DC2626" />
    </svg>
  )
}
