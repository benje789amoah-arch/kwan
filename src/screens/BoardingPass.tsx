import { QRCodeSVG } from 'qrcode.react'
import { Link } from 'react-router-dom'
import { getRoute, niceDate, tripLines } from '../data'
import { useOnline, useStore } from '../store'
import { Icon, PageTitle, btnPrimary, card, eyebrow } from '../ui'

export default function BoardingPass() {
  const { state } = useStore()
  const online = useOnline()
  const { pass } = state
  const route = getRoute(pass?.routeId)

  if (!pass || !route) {
    return (
      <main className="flex-1 animate-enter px-4 pt-[max(1.25rem,env(safe-area-inset-top))] pb-8">
        <PageTitle className="text-3xl leading-tight font-extrabold">Your pass</PageTitle>
        <section className={`${card} mt-5 p-5`}>
          <span className="grid size-12 place-items-center rounded-xl bg-brand-tint text-brand-fg">
            <Icon name="pass" size="lg" />
          </span>
          <h2 className="mt-4 text-xl font-extrabold">No pass yet</h2>
          <p className="mt-1 text-fg-muted">
            Your boarding code appears here once you book a route. It is saved on your phone, so it opens without data.
          </p>
          <Link to="/routes" className={`${btnPrimary} mt-5`}>
            Find my route <Icon name="next" />
          </Link>
        </section>
      </main>
    )
  }

  const lines = tripLines(route, pass.homeId, pass.workId, pass.trip)

  return (
    <main className="flex-1 animate-enter bg-brand px-4 pt-[max(1.25rem,env(safe-area-inset-top))] pb-8 text-on-brand">
      <PageTitle className="text-3xl leading-tight font-extrabold">Your pass</PageTitle>

      <p
        role="status"
        className={`mt-4 flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold ${
          online ? 'bg-on-brand/10' : 'bg-accent text-on-accent'
        }`}
      >
        <Icon name={online ? 'ok' : 'offline'} />
        {online ? 'Saved on this phone. Works without data.' : 'You are offline. Your code still works.'}
      </p>

      {/* The ticket is always dark ink on white so the conductor can read and scan it in any theme. */}
      <section className="relative mt-4 rounded-2xl bg-paper text-ink">
        <div className="px-5 pt-5 pb-5 text-center">
          <p className={`${eyebrow} text-ink-muted`}>Show this to the conductor</p>
          <p className="mt-1 text-6xl font-extrabold tracking-tight text-[#0e4b36]">{pass.code}</p>
          <div className="mt-4 inline-block rounded-xl border border-paper-line p-3">
            <QRCodeSVG value={`kwan:${pass.code}`} size={168} fgColor="#10241c" bgColor="#ffffff" />
          </div>
          <p className="mt-3 text-xl font-extrabold">{state.name}</p>
          <p className="text-ink-muted">
            {route.from} to {route.to}
          </p>
        </div>

        <div className="relative border-t-2 border-dashed border-paper-line px-5 py-4">
          {/* The two notches that make it read as a ticket. */}
          <span className="absolute -top-3 -left-3 size-6 rounded-full bg-brand" aria-hidden="true" />
          <span className="absolute -top-3 -right-3 size-6 rounded-full bg-brand" aria-hidden="true" />
          <ul className="space-y-3">
            {lines.map((l) => (
              <li key={l.label} className="flex items-baseline justify-between gap-3">
                <span>
                  <span className="block text-sm text-ink-muted">{l.label} · get on at</span>
                  <span className="block font-bold">{l.board}</span>
                </span>
                <span className="text-lg font-extrabold whitespace-nowrap">{l.boardAt}</span>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-sm text-ink-muted">
            Valid {niceDate(pass.startsOn)} to {niceDate(pass.endsOn)}
          </p>
        </div>
      </section>
    </main>
  )
}
