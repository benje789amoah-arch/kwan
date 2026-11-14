import { QRCodeSVG } from 'qrcode.react'
import { Navigate, useNavigate } from 'react-router-dom'
import { getRoute, niceDate, tripLines } from '../data'
import { useOnline, useStore } from '../store'
import { Icon } from '../ui'

export default function BoardingPass() {
  const { state } = useStore()
  const nav = useNavigate()
  const online = useOnline()
  const { pass } = state
  const route = getRoute(pass?.routeId)
  if (!pass || !route) return <Navigate to="/home" replace />

  const lines = tripLines(route, pass.homeId, pass.workId, pass.trip)

  return (
    <div className="flex min-h-dvh flex-col bg-forest px-4 pt-4 pb-6 text-white">
      <button
        type="button"
        aria-label="Back"
        onClick={() => nav(-1)}
        className="grid size-12 place-items-center rounded-full bg-white/10"
      >
        <Icon name="back" />
      </button>

      <p
        role="status"
        className={`mt-4 flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold ${
          online ? 'bg-white/10' : 'bg-sun text-ink'
        }`}
      >
        <Icon name={online ? 'check' : 'offline'} size={18} />
        {online ? 'Saved on this phone. Works without data.' : 'You are offline. Your code still works.'}
      </p>

      <section className="mt-4 overflow-hidden rounded-3xl bg-card text-ink">
        <div className="px-5 pt-5 pb-4 text-center">
          <p className="text-sm font-bold uppercase tracking-wider text-muted">Show this to the conductor</p>
          <p className="mt-1 text-6xl font-extrabold tracking-tight text-forest">{pass.code}</p>
          <div className="mt-4 inline-block rounded-2xl border border-line p-3">
            <QRCodeSVG value={`kwan:${pass.code}`} size={168} fgColor="#10241c" />
          </div>
          <p className="mt-3 text-xl font-extrabold">{state.name}</p>
          <p className="text-muted">
            {route.from} to {route.to}
          </p>
        </div>

        <div className="border-t-2 border-dashed border-line px-5 py-4">
          <ul className="space-y-3">
            {lines.map((l) => (
              <li key={l.label} className="flex items-baseline justify-between gap-3">
                <span>
                  <span className="block text-sm text-muted">{l.label} · board at</span>
                  <span className="block font-bold">{l.board}</span>
                </span>
                <span className="text-lg font-extrabold">{l.boardAt}</span>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-sm text-muted">
            Valid {niceDate(pass.startsOn)} to {niceDate(pass.endsOn)}
          </p>
        </div>
      </section>
    </div>
  )
}
