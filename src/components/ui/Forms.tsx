import { forwardRef, type InputHTMLAttributes, type LabelHTMLAttributes, type ReactNode, type SelectHTMLAttributes } from 'react'

export function Label({ children, className = '', ...props }: LabelHTMLAttributes<HTMLLabelElement> & { children: ReactNode }) {
  return (
    <label className={`mb-1 block text-sm font-medium text-ink ${className}`} {...props}>
      {children}
    </label>
  )
}

export const TextInput = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(function TextInput(
  { className = '', ...props },
  ref,
) {
  return (
    <input
      ref={ref}
      className={`w-full rounded-md border border-line bg-surface px-3 py-2 text-sm text-ink placeholder:text-muted focus-visible:outline-primary ${className}`}
      {...props}
    />
  )
})

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(function Select(
  { className = '', children, ...props },
  ref,
) {
  return (
    <select
      ref={ref}
      className={`w-full rounded-md border border-line bg-surface px-3 py-2 text-sm text-ink focus-visible:outline-primary ${className}`}
      {...props}
    >
      {children}
    </select>
  )
})

export function Checkbox({ label, ...props }: InputHTMLAttributes<HTMLInputElement> & { label: ReactNode }) {
  return (
    <label className="flex items-start gap-2 text-sm text-ink">
      <input type="checkbox" className="mt-0.5 h-4 w-4 shrink-0 rounded border-line text-primary focus-visible:outline-primary" {...props} />
      <span className="min-w-0 flex-1 break-words">{label}</span>
    </label>
  )
}

interface RangeSliderProps {
  min: number
  max: number
  step?: number
  value: number
  onChange: (valor: number) => void
  etiqueta?: (valor: number) => string
  ariaLabel?: string
}

export function RangeSlider({ min, max, step = 1, value, onChange, etiqueta, ariaLabel }: RangeSliderProps) {
  return (
    <div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-[var(--color-primary)]"
        aria-label={ariaLabel}
      />
      <div className="mt-1 text-right text-xs text-muted">{etiqueta ? etiqueta(value) : value}</div>
    </div>
  )
}

interface RangeDualProps {
  min: number
  max: number
  step?: number
  valorMin: number
  valorMax: number
  onChange: (min: number, max: number) => void
  etiqueta?: (valor: number) => string
  nomCamp?: string
}

export function RangeDualSlider({ min, max, step = 0.1, valorMin, valorMax, onChange, etiqueta, nomCamp }: RangeDualProps) {
  const percentMin = ((valorMin - min) / (max - min)) * 100
  const percentMax = ((valorMax - min) / (max - min)) * 100
  // Quan els dos valors es toquen, cal poder continuar agafant cada nansa per separat:
  // la que és més a prop del cursor passa davant (z-index) en cada input.
  const minAlDavant = valorMin >= max - (max - min) * 0.05

  return (
    <div>
      <div className="relative h-5">
        <div className="absolute inset-x-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-line" />
        <div
          className="absolute top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-primary"
          style={{ left: `${percentMin}%`, right: `${100 - percentMax}%` }}
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={valorMin}
          onChange={(e) => onChange(Math.min(Number(e.target.value), valorMax), valorMax)}
          className="dual-range"
          style={{ zIndex: minAlDavant ? 3 : 2 }}
          aria-label={nomCamp ? `${nomCamp}, valor mínim` : 'Valor mínim'}
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={valorMax}
          onChange={(e) => onChange(valorMin, Math.max(Number(e.target.value), valorMin))}
          className="dual-range"
          style={{ zIndex: minAlDavant ? 2 : 3 }}
          aria-label={nomCamp ? `${nomCamp}, valor màxim` : 'Valor màxim'}
        />
      </div>
      <div className="mt-1 text-right text-xs text-muted">
        {etiqueta ? `${etiqueta(valorMin)} – ${etiqueta(valorMax)}` : `${valorMin} – ${valorMax}`}
      </div>
    </div>
  )
}
