import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'

export const btn =
  'inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl px-5 text-base font-bold transition-transform active:scale-[0.99] disabled:opacity-40'
export const btnPrimary = `${btn} bg-forest text-white`
export const btnAccent = `${btn} bg-sun text-ink`
export const btnQuiet = `${btn} border border-line bg-card text-ink`

export const field =
  'min-h-14 w-full rounded-2xl border border-line bg-card px-4 text-lg text-ink placeholder:text-muted/70 focus:border-forest'

/** A radio styled as a card. The real input stays in the DOM for keyboards and screen readers. */
export const choice =
  'flex cursor-pointer items-center gap-3 rounded-2xl border-2 border-line bg-card px-4 py-3 has-[:checked]:border-forest has-[:checked]:bg-leaf has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-sun'

export function Logo({ light = false }: { light?: boolean }) {
  return (
    <span className={`inline-flex items-center gap-2 text-2xl font-extrabold tracking-tight ${light ? 'text-white' : 'text-forest'}`}>
      <svg width="30" height="30" viewBox="0 0 30 30" aria-hidden="true">
        <rect width="30" height="30" rx="9" fill={light ? '#ffc233' : '#0e4b36'} />
        <path
          d="M10 24c0-7 10-7 10-18"
          fill="none"
          stroke={light ? '#0e4b36' : '#ffc233'}
          strokeWidth="3.5"
          strokeLinecap="round"
        />
      </svg>
      kwan
    </span>
  )
}

type IconName = 'back' | 'next' | 'check' | 'shield' | 'offline' | 'clock' | 'seat' | 'search'

const paths: Record<IconName, string> = {
  back: 'M15 5l-7 7 7 7',
  next: 'M9 5l7 7-7 7',
  check: 'M5 12.5l4.5 4.5L19 7.5',
  shield: 'M12 3l7 3v5.5c0 4.3-2.9 7.6-7 9.5-4.1-1.9-7-5.2-7-9.5V6l7-3zM9 12l2.2 2.2L15.2 10',
  offline: 'M3 3l18 18M5 12.5a10 10 0 0 1 3.5-2.4M19 12.5a10 10 0 0 0-5.5-3M8.5 16a5 5 0 0 1 5-1M12 19.5h.01',
  clock: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 7.5V12l3 2',
  seat: 'M7 4v9a2 2 0 0 0 2 2h7M7 20v-3M17 20v-5M9 4h1.5a1.5 1.5 0 0 1 1.5 1.5V11',
  search: 'M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14zM20 20l-4-4',
}

export function Icon({ name, size = 22 }: { name: IconName; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="shrink-0"
    >
      <path d={paths[name]} />
    </svg>
  )
}

const stepNames = ['Route', 'Stops', 'Plan', 'Pay']

export function Screen({
  title,
  step,
  back = true,
  children,
  footer,
}: {
  title: string
  step?: 1 | 2 | 3 | 4
  back?: boolean
  children: ReactNode
  footer?: ReactNode
}) {
  const nav = useNavigate()
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-10 bg-paper px-4 pt-4 pb-3">
        <div className="flex items-center gap-3">
          {back && (
            <button
              type="button"
              aria-label="Back"
              onClick={() => nav(-1)}
              className="grid size-12 shrink-0 place-items-center rounded-full border border-line bg-card"
            >
              <Icon name="back" />
            </button>
          )}
          <div className="min-w-0">
            {step && (
              <p className="text-xs font-bold uppercase tracking-wider text-muted">
                Step {step} of 4 · {stepNames[step - 1]}
              </p>
            )}
            <h1 className="text-2xl font-extrabold leading-tight">{title}</h1>
          </div>
        </div>
        {step && (
          <div className="mt-3 grid grid-cols-4 gap-1.5" aria-hidden="true">
            {stepNames.map((n, i) => (
              <span key={n} className={`h-1.5 rounded-full ${i < step ? 'bg-forest' : 'bg-line'}`} />
            ))}
          </div>
        )}
      </header>
      <main className="flex-1 px-4 pb-6">{children}</main>
      {footer && <footer className="sticky bottom-0 border-t border-line bg-paper px-4 py-3">{footer}</footer>}
    </div>
  )
}

export function Row({ label, value, strong = false }: { label: string; value: ReactNode; strong?: boolean }) {
  return (
    <div className={`flex items-baseline justify-between gap-4 py-1.5 ${strong ? 'text-lg font-extrabold' : ''}`}>
      <span className={strong ? '' : 'text-muted'}>{label}</span>
      <span className="text-right font-semibold">{value}</span>
    </div>
  )
}
