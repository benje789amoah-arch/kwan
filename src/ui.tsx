import { useEffect, useId, useRef, type ButtonHTMLAttributes, type InputHTMLAttributes, type ReactNode, type Ref } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import {
  Armchair,
  ArrowLeft,
  ArrowRight,
  Bus,
  CalendarDays,
  Check,
  ChevronRight,
  CircleCheck,
  CircleUser,
  CircleX,
  Clock,
  Delete,
  House,
  Info,
  LoaderCircle,
  MapPin,
  RotateCcw,
  Route,
  Search,
  ShieldCheck,
  Ticket,
  TriangleAlert,
  Wallet,
  WifiOff,
} from 'lucide-react'

/* ---------- Icons: one set, one stroke width, three sizes ---------- */

const icons = {
  back: ArrowLeft,
  next: ArrowRight,
  chevron: ChevronRight,
  check: Check,
  ok: CircleCheck,
  warn: TriangleAlert,
  bad: CircleX,
  info: Info,
  shield: ShieldCheck,
  offline: WifiOff,
  clock: Clock,
  seat: Armchair,
  search: Search,
  home: House,
  pass: Ticket,
  routes: Route,
  account: CircleUser,
  bus: Bus,
  pin: MapPin,
  erase: Delete,
  restart: RotateCcw,
  wallet: Wallet,
  calendar: CalendarDays,
  spinner: LoaderCircle,
}

export type IconName = keyof typeof icons
const iconSizes = { sm: 16, md: 20, lg: 24, xl: 32 }

/** Icons are decorative here: every one sits beside text or inside a labelled control. */
export function Icon({ name, size = 'md', className = '' }: { name: IconName; size?: keyof typeof iconSizes; className?: string }) {
  const Glyph = icons[name]
  return <Glyph size={iconSizes[size]} strokeWidth={2} aria-hidden="true" className={`shrink-0 ${className}`} />
}

/* ---------- Buttons ---------- */

const btnBase =
  'inline-flex min-h-13 w-full cursor-pointer items-center justify-center gap-2 rounded-xl px-5 text-base font-semibold transition-colors duration-150 disabled:pointer-events-none disabled:opacity-45'
export const btnPrimary = `${btnBase} bg-brand text-on-brand active:bg-brand-strong`
export const btnAccent = `${btnBase} bg-accent text-on-accent active:bg-accent-strong`
export const btnQuiet = `${btnBase} border border-outline bg-surface text-fg active:bg-sunken`
export const btnDanger = `${btnBase} bg-danger text-on-danger active:opacity-90`
/** For use on a brand-coloured background. */
export const btnOnBrand = `${btnBase} border border-on-brand/40 text-on-brand active:bg-on-brand/10`

const variants = { primary: btnPrimary, accent: btnAccent, quiet: btnQuiet, danger: btnDanger }

export function Button({
  variant = 'primary',
  busy = false,
  className = '',
  children,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: keyof typeof variants; busy?: boolean }) {
  return (
    <button {...rest} aria-busy={busy || undefined} disabled={rest.disabled || busy} className={`${variants[variant]} ${className}`}>
      {busy && <Icon name="spinner" className="animate-spin" />}
      {children}
    </button>
  )
}

/* ---------- Form pieces ---------- */

/** A radio styled as a card. The real input stays in the DOM for keyboards and screen readers. */
export const choice =
  'flex min-h-14 cursor-pointer items-center gap-3 rounded-xl border border-outline bg-surface px-4 py-3 transition-colors duration-150 active:bg-sunken has-[:checked]:border-brand-fg has-[:checked]:bg-brand-tint has-[:checked]:shadow-[inset_0_0_0_1px_var(--brand-fg)] has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-accent'

export const radio = 'size-5 shrink-0 accent-brand-fg'

const inputBase =
  'min-h-14 w-full rounded-xl border bg-surface px-4 text-lg text-fg placeholder:text-fg-muted focus:border-brand-fg'

/** A labelled input. The error is shown under the field and announced, never by colour alone. */
export function Field({
  label,
  hint,
  error,
  prefix,
  inputRef,
  className = '',
  ...rest
}: InputHTMLAttributes<HTMLInputElement> & {
  label: string
  hint?: string
  error?: string
  prefix?: string
  inputRef?: Ref<HTMLInputElement>
}) {
  const id = useId()
  // The error replaces the hint on screen, so the input points at whichever one is showing.
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined
  return (
    <div>
      <label htmlFor={id} className="mb-2 block font-semibold">
        {label}
      </label>
      <div className="flex gap-2">
        {prefix && (
          <span className="grid min-h-14 place-items-center rounded-xl border border-outline bg-sunken px-4 text-lg font-semibold">
            {prefix}
          </span>
        )}
        <input
          {...rest}
          id={id}
          ref={inputRef}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={`${inputBase} ${error ? 'border-danger-fg' : 'border-outline'} ${className}`}
        />
      </div>
      {error ? (
        <p id={`${id}-error`} role="alert" className="mt-2 flex items-start gap-1.5 text-sm font-semibold text-danger-fg">
          <Icon name="warn" size="sm" className="mt-0.5" /> {error}
        </p>
      ) : (
        hint && (
          <p id={`${id}-hint`} className="mt-2 text-sm text-fg-muted">
            {hint}
          </p>
        )
      )}
    </div>
  )
}

/* ---------- Page structure ---------- */

export function Logo({ onBrand = false }: { onBrand?: boolean }) {
  return (
    <span className={`inline-flex items-center gap-2 text-2xl font-extrabold tracking-tight ${onBrand ? 'text-on-brand' : 'text-brand-fg'}`}>
      <svg width="30" height="30" viewBox="0 0 30 30" aria-hidden="true">
        <rect width="30" height="30" rx="9" fill={onBrand ? 'var(--accent)' : 'var(--brand)'} />
        <path
          d="M10 24c0-7 10-7 10-18"
          fill="none"
          stroke={onBrand ? 'var(--on-accent)' : 'var(--accent)'}
          strokeWidth="3.5"
          strokeLinecap="round"
        />
      </svg>
      kwan
    </span>
  )
}

/** The screen's heading. It takes focus when the screen opens so a screen reader starts in the right place. */
export function PageTitle({ children, className = '' }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLHeadingElement>(null)
  useEffect(() => {
    ref.current?.focus({ preventScroll: true })
  }, [])
  return (
    <h1 ref={ref} tabIndex={-1} className={className}>
      {children}
    </h1>
  )
}

const stepNames = ['Stops', 'Plan', 'Pay']

/** A screen inside a flow: a back button, a title, and an optional action pinned to the bottom. */
export function Screen({
  title,
  step,
  back = '/home',
  children,
  footer,
}: {
  title: string
  step?: 1 | 2 | 3
  /** Where Back goes when there is no earlier screen to return to. */
  back?: string
  children: ReactNode
  footer?: ReactNode
}) {
  const nav = useNavigate()
  // Back returns to the previous screen when there is one, so scroll and choices are kept.
  const goBack = () => ((window.history.state?.idx ?? 0) > 0 ? nav(-1) : nav(back, { replace: true }))

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-10 bg-canvas px-4 pt-[max(1rem,env(safe-area-inset-top))] pb-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            aria-label="Back"
            onClick={goBack}
            className="grid size-12 shrink-0 cursor-pointer place-items-center rounded-full border border-outline bg-surface transition-colors duration-150 active:bg-sunken"
          >
            <Icon name="back" size="lg" />
          </button>
          <div className="min-w-0">
            {step && (
              <p className="text-xs font-bold uppercase tracking-wider text-fg-muted">
                Step {step} of 3 · {stepNames[step - 1]}
              </p>
            )}
            <PageTitle className="text-2xl leading-tight font-extrabold">{title}</PageTitle>
          </div>
        </div>
        {step && (
          <div className="mt-3 grid grid-cols-3 gap-1.5" aria-hidden="true">
            {stepNames.map((n, i) => (
              <span key={n} className={`h-1.5 rounded-full ${i < step ? 'bg-brand-fg' : 'bg-line'}`} />
            ))}
          </div>
        )}
      </header>
      <main className="flex-1 animate-enter px-4 pb-8">{children}</main>
      {footer && (
        <footer className="sticky bottom-0 border-t border-line bg-canvas px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          {footer}
        </footer>
      )}
    </div>
  )
}

const tabs: { to: string; label: string; icon: IconName }[] = [
  { to: '/home', label: 'Home', icon: 'home' },
  { to: '/pass', label: 'Pass', icon: 'pass' },
  { to: '/routes', label: 'Routes', icon: 'routes' },
  { to: '/account', label: 'Account', icon: 'account' },
]

/** Top-level navigation. The current tab is marked by shape and weight as well as colour. */
export function TabBar() {
  return (
    <nav aria-label="Main" className="sticky bottom-0 z-20 border-t border-line bg-surface pb-[env(safe-area-inset-bottom)]">
      <ul className="grid grid-cols-4">
        {tabs.map((t) => (
          <li key={t.to}>
            <NavLink
              to={t.to}
              className={({ isActive }) =>
                `flex min-h-16 flex-col items-center justify-center gap-0.5 text-xs transition-colors duration-150 ${
                  isActive ? 'font-extrabold text-brand-fg' : 'font-semibold text-fg-muted'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span className={`grid h-8 w-14 place-items-center rounded-full ${isActive ? 'bg-brand-tint' : ''}`}>
                    <Icon name={t.icon} size="lg" />
                  </span>
                  {t.label}
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}

/* ---------- Small shared pieces ---------- */

export function Row({ label, value, strong = false }: { label: string; value: ReactNode; strong?: boolean }) {
  return (
    <div className={`flex items-baseline justify-between gap-4 py-1.5 ${strong ? 'text-lg font-extrabold' : ''}`}>
      <span className={strong ? '' : 'text-fg-muted'}>{label}</span>
      <span className="text-right font-semibold">{value}</span>
    </div>
  )
}

export const card = 'rounded-2xl border border-line bg-surface'
export const eyebrow = 'text-xs font-bold uppercase tracking-wider'

const noteTones = {
  info: 'bg-brand-tint text-fg',
  warn: 'bg-accent-tint text-fg',
  bad: 'bg-danger-tint text-fg',
}
const noteIcons: Record<keyof typeof noteTones, IconName> = { info: 'info', warn: 'warn', bad: 'bad' }

/** A short message with an icon, so its meaning does not depend on colour. */
export function Note({ tone = 'info', icon, children, status = false }: { tone?: keyof typeof noteTones; icon?: IconName; children: ReactNode; status?: boolean }) {
  return (
    <p role={status ? 'status' : undefined} className={`flex items-start gap-2.5 rounded-xl px-4 py-3 text-sm ${noteTones[tone]}`}>
      <Icon name={icon ?? noteIcons[tone]} className="mt-0.5" />
      <span>{children}</span>
    </p>
  )
}

/** Where to get on and where to get off, drawn as a two-stop line. Colours come from the parent. */
export function Journey({ from, fromTime, to, toTime }: { from: string; fromTime: string; to: string; toTime: string }) {
  return (
    <ol className="mt-3">
      <li className="flex gap-3">
        <span className="flex flex-col items-center" aria-hidden="true">
          <span className="mt-1.5 size-3 rounded-full bg-current" />
          <span className="w-0.5 flex-1 bg-current opacity-30" />
        </span>
        <span className="flex flex-1 items-baseline justify-between gap-3 pb-4">
          <span>
            <span className="block text-xs font-semibold opacity-75">Get on</span>
            <span className="block text-lg leading-snug font-bold">{from}</span>
          </span>
          <span className="text-lg font-extrabold whitespace-nowrap">{fromTime}</span>
        </span>
      </li>
      <li className="flex gap-3">
        <span className="flex flex-col items-center" aria-hidden="true">
          <span className="mt-1.5 size-3 rounded-full border-2 border-current" />
        </span>
        <span className="flex flex-1 items-baseline justify-between gap-3">
          <span>
            <span className="block text-xs font-semibold opacity-75">Get off</span>
            <span className="block leading-snug font-semibold">{to}</span>
          </span>
          <span className="font-semibold whitespace-nowrap opacity-90">{toTime}</span>
        </span>
      </li>
    </ol>
  )
}
