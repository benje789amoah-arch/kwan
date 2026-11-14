import { Link, Navigate } from 'react-router-dom'
import { useStore } from '../store'
import { Icon, Logo, btnAccent } from '../ui'

const points = [
  'A reserved seat on every ride',
  'Fixed times at a stop near you',
  'Pay with mobile money, see the full price first',
]

export default function Welcome() {
  const { state } = useStore()
  if (state.name) return <Navigate to="/home" replace />

  return (
    <div className="flex min-h-dvh flex-col bg-forest px-6 pt-8 pb-6 text-white">
      <Logo light />

      <div className="mt-auto pt-16">
        <h1 className="text-[2.6rem] font-extrabold leading-[1.05] tracking-tight">
          A seat saved for you, <span className="text-sun">every morning.</span>
        </h1>
        <p className="mt-4 text-lg text-white/85">
          Kwan is a commuter bus you subscribe to. Pick your route once, then just show up.
        </p>

        <ul className="mt-6 space-y-3">
          {points.map((p) => (
            <li key={p} className="flex items-start gap-3">
              <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-sun text-ink">
                <Icon name="check" size={16} />
              </span>
              <span>{p}</span>
            </li>
          ))}
        </ul>

        <Link to="/sign-in" className={`${btnAccent} mt-8`}>
          Get started <Icon name="next" />
        </Link>
        <p className="mt-4 text-center text-sm text-white/70">
          Nothing to install. Concept prototype with made-up routes and prices.
        </p>
        <Link to="/driver" className="mt-3 block py-2 text-center text-sm font-semibold text-white underline">
          Driving for Kwan? Open driver check-in
        </Link>
      </div>
    </div>
  )
}
