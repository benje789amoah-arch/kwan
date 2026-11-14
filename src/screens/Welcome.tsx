import { Link, Navigate } from 'react-router-dom'
import { useStore } from '../store'
import { Icon, Logo, PageTitle, btnAccent } from '../ui'

const points = [
  'A reserved seat on every ride',
  'Fixed times at a stop near you',
  'Pay with mobile money, see the full price first',
]

/** A flat drawing of a road with three stops: the logo's road, stretched across the screen. */
function RoadArt() {
  const road = 'M-10 120 C 70 120, 80 40, 160 60 S 260 110, 330 30'
  return (
    <svg viewBox="0 0 320 150" className="mt-2 w-full" aria-hidden="true">
      <path d={road} fill="none" stroke="var(--on-brand)" strokeOpacity="0.14" strokeWidth="28" strokeLinecap="round" />
      <path d={road} fill="none" stroke="var(--accent)" strokeWidth="3" strokeDasharray="2 12" strokeLinecap="round" />
      {[
        [75, 82.5],
        [160, 60],
        [248.75, 82.5],
      ].map(([x, y]) => (
        <g key={x}>
          <circle cx={x} cy={y} r="10" fill="var(--accent)" />
          <circle cx={x} cy={y} r="4" fill="var(--brand)" />
        </g>
      ))}
    </svg>
  )
}

export default function Welcome() {
  const { state } = useStore()
  if (state.name) return <Navigate to="/home" replace />

  return (
    <div className="flex min-h-dvh flex-col bg-brand px-5 pt-[max(1.5rem,env(safe-area-inset-top))] pb-[max(1.25rem,env(safe-area-inset-bottom))] text-on-brand">
      <Logo onBrand />
      <RoadArt />

      <main className="mt-auto animate-enter pt-6">
        <PageTitle className="text-[2.5rem] leading-[1.08] font-extrabold tracking-tight">
          A seat saved for you, <span className="text-accent">every morning.</span>
        </PageTitle>
        <p className="mt-4 text-lg text-on-brand/85">
          Kwan is a commuter bus you subscribe to. Pick your route once, then just show up.
        </p>

        <ul className="mt-6 space-y-3">
          {points.map((p) => (
            <li key={p} className="flex items-start gap-3">
              <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-accent text-on-accent">
                <Icon name="check" size="sm" />
              </span>
              <span>{p}</span>
            </li>
          ))}
        </ul>

        <Link to="/sign-in" className={`${btnAccent} mt-6`}>
          Get started <Icon name="next" />
        </Link>
        <p className="mt-4 text-center text-sm text-on-brand/75">
          Nothing to install. Concept prototype with made-up routes and prices.
        </p>
        <Link to="/driver" className="mt-1 flex min-h-12 items-center justify-center text-sm font-semibold underline">
          Driving for Kwan? Open driver check-in
        </Link>
      </main>
    </div>
  )
}
