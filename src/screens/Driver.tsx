import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { firstLeg, getRoute, routes } from '../data'
import { useOnline, useStore } from '../store'
import { Icon, Logo, type IconName } from '../ui'

/**
 * Check-in for the driver or conductor. Built for a basic phone held in one hand at a busy stop:
 * an on-screen keypad instead of the system keyboard, one large result banner, and a rider list
 * as the fallback when a rider's phone is dead. The list shows a first name and initial only.
 */

type Rider = {
  name: string
  code: string
  /** Index, in the run's stop order, of the stop this rider is expected at. */
  boardIdx: number
  catchingUpFrom?: string
  isYou?: boolean
}

type Result = { tone: 'ok' | 'warn' | 'bad'; title: string; detail: string }
type Run = { at: number; boarded: Record<string, number>; done: boolean }

const KEY = 'kwan-driver-v1'
const freshRun: Run = { at: 0, boarded: {}, done: false }

// Made-up riders, so the run has people on it besides the tester.
const others: Rider[] = [
  { name: 'Kofi M.', code: 'KW-2041', boardIdx: 0 },
  { name: 'Abena O.', code: 'KW-3317', boardIdx: 0 },
  { name: 'Yaw B.', code: 'KW-5560', boardIdx: 1 },
  { name: 'Efua A.', code: 'KW-1873', boardIdx: 1 },
  { name: 'Kwesi A.', code: 'KW-4429', boardIdx: 2 },
  { name: 'Adwoa S.', code: 'KW-6092', boardIdx: 2 },
  { name: 'Nii L.', code: 'KW-7735', boardIdx: 3 },
  { name: 'Akosua D.', code: 'KW-8256', boardIdx: 4 },
]

const tones: Record<Result['tone'], string> = {
  ok: 'bg-brand text-on-brand',
  warn: 'bg-accent text-on-accent',
  bad: 'bg-danger text-on-danger',
}

// Each answer has its own icon as well as its own colour.
const toneIcons: Record<Result['tone'], IconName> = { ok: 'ok', warn: 'warn', bad: 'bad' }

function loadRun(): Run {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? { ...freshRun, ...JSON.parse(raw) } : freshRun
  } catch {
    return freshRun
  }
}

export default function Driver() {
  const { state, update } = useStore()
  const online = useOnline()
  const { pass, outcome } = state
  const route = getRoute(pass?.routeId) ?? routes[0]
  const leg = pass
    ? firstLeg(route, pass.homeId, pass.workId, pass.trip)
    : firstLeg(route, route.stops[0].id, route.stops[route.stops.length - 1].id, 'morning')
  const lastBoardingIdx = leg.stops.length - 2

  const [run, setRun] = useState<Run>(loadRun)
  const [digits, setDigits] = useState('')
  const [result, setResult] = useState<Result | null>(null)
  const [confirming, setConfirming] = useState(false)

  // Check-ins are kept on the phone, so a reload or a dead spot does not lose them.
  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(run))
    } catch {
      // Storage can be blocked; the run still works until the page closes.
    }
  }, [run])

  // The tester's own pass joins the run, so the code on their boarding pass really works here.
  const riders: Rider[] = others.filter((r) => r.code !== pass?.code)
  if (pass) {
    const catching = outcome?.kind === 'catch'
    riders.push({
      name: state.name,
      code: pass.code,
      boardIdx: catching ? leg.stops.findIndex((s) => s.id === outcome.stopId) : leg.boardIdx,
      catchingUpFrom: catching ? leg.stops[leg.boardIdx].name : undefined,
      isYou: true,
    })
  }

  const stop = leg.stops[run.at]
  const here = riders.filter((r) => r.boardIdx === run.at)
  const waiting = here.filter((r) => run.boarded[r.code] === undefined)
  const onBoard = Object.keys(run.boarded).length

  function show(next: Result) {
    setResult(next)
    navigator.vibrate?.(next.tone === 'ok' ? 80 : [80, 60, 80])
  }

  function check(code: string) {
    const rider = riders.find((r) => r.code === code)
    if (!rider) {
      return show({ tone: 'bad', title: 'Code not found', detail: `No pass matches ${code}. Ask to see the code again.` })
    }
    if (run.boarded[code] !== undefined) {
      return show({
        tone: 'warn',
        title: `${rider.name} is already on board`,
        detail: `Checked in at ${leg.stops[run.boarded[code]].name}.`,
      })
    }
    if (rider.isYou && outcome?.kind === 'saved') {
      return show({
        tone: 'bad',
        title: `${rider.name} is not on this run`,
        detail: 'They moved today’s ride to another day.',
      })
    }

    setRun((r) => ({ ...r, boarded: { ...r.boarded, [code]: r.at } }))
    if (rider.isYou && pass) {
      update({ outcome: { kind: 'aboard' }, pass: { ...pass, ridesLeft: pass.ridesLeft - 1 } })
    }

    const booked = leg.stops[rider.boardIdx].name
    if (rider.catchingUpFrom) {
      show({ tone: 'ok', title: `Welcome, ${rider.name}`, detail: `Catching up from ${rider.catchingUpFrom}. Seat held.` })
    } else if (rider.boardIdx === run.at) {
      show({ tone: 'ok', title: `Welcome, ${rider.name}`, detail: 'Seat confirmed.' })
    } else if (rider.boardIdx < run.at) {
      show({ tone: 'ok', title: `${rider.name} can board`, detail: `Missed the bus at ${booked}. Seat is still held.` })
    } else {
      show({ tone: 'warn', title: `${rider.name} can board`, detail: `Booked from ${booked}, further along. Early is fine.` })
    }
  }

  function press(digit: string) {
    const next = (result ? '' : digits) + digit
    setResult(null)
    setDigits(next)
    if (next.length === 4) check(`KW-${next}`)
  }

  function erase() {
    setDigits(result ? '' : digits.slice(0, -1))
    setResult(null)
  }

  function leave() {
    // Leaving a stop is what tells a rider who is not on board that they have missed the bus.
    const you = riders.find((r) => r.isYou)
    if (you && pass && you.boardIdx === run.at && run.boarded[you.code] === undefined) {
      if (outcome?.kind === 'catch') {
        update({ outcome: { kind: 'used' }, pass: { ...pass, ridesLeft: pass.ridesLeft - 1 } })
      } else if (!outcome && (state.scenario === 'before' || state.scenario === 'soon')) {
        update({ scenario: 'left' })
      }
    }
    setRun((r) => (r.at >= lastBoardingIdx ? { ...r, done: true } : { ...r, at: r.at + 1 }))
    setConfirming(false)
    setResult(null)
    setDigits('')
  }

  function restart() {
    setRun(freshRun)
    setResult(null)
    setDigits('')
    setConfirming(false)
  }

  const header = (
    <header className="bg-brand px-4 pt-[max(1rem,env(safe-area-inset-top))] pb-4 text-on-brand">
      <div className="flex items-center justify-between">
        <Logo onBrand />
        <Link to="/" className="rounded-full bg-on-brand/10 px-4 py-2 text-sm font-semibold">
          Rider app
        </Link>
      </div>
      <p className="mt-3 text-sm font-bold uppercase tracking-wider text-accent">
        Driver check-in · {leg.label} run
      </p>
      <p className="text-on-brand/85">
        {leg.stops[0].name} to {leg.stops[leg.stops.length - 1].name}
      </p>
    </header>
  )

  if (run.done) {
    const missed = riders.filter((r) => run.boarded[r.code] === undefined)
    return (
      <div className="flex min-h-dvh flex-col">
        {header}
        <main className="flex-1 px-4 py-5">
          <h1 className="text-3xl leading-tight font-extrabold">Run complete</h1>
          <p className="mt-1 text-lg">
            {onBoard} of {riders.length} riders boarded.
          </p>
          {missed.length > 0 && (
            <section className="mt-4 rounded-2xl border border-line bg-surface p-4">
              <h2 className="font-bold">Did not board</h2>
              <ul className="mt-2 space-y-1">
                {missed.map((r) => (
                  <li key={r.code} className="flex justify-between gap-3">
                    <span className="font-semibold">{r.name}</span>
                    <span className="text-fg-muted">{leg.stops[r.boardIdx].name}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-sm text-fg-muted">Each of them has been told the bus left, with their options.</p>
            </section>
          )}
          <button
            type="button"
            onClick={restart}
            className="mt-6 min-h-16 w-full rounded-2xl bg-brand text-lg font-bold text-on-brand"
          >
            Start a new run
          </button>
        </main>
      </div>
    )
  }

  return (
    <div className="flex min-h-dvh flex-col">
      {header}

      <section className="border-b border-line bg-surface px-4 py-3">
        <p className="text-sm font-bold text-fg-muted">
          Stop {run.at + 1} of {leg.stops.length} · leaves {stop.time}
        </p>
        <h1 className="text-3xl leading-tight font-extrabold">{stop.name}</h1>
        <p className="mt-1 font-semibold">
          {here.length - waiting.length} of {here.length} boarded here · {onBoard} on the bus
        </p>
      </section>

      {!online && (
        <p role="status" className="flex items-center gap-2 bg-accent px-4 py-3 text-sm font-bold text-on-accent">
          <Icon name="offline" /> No network. Check-ins are saved on this phone and sent later.
        </p>
      )}

      <main className="flex-1 px-4 pt-4 pb-8">
        <p className="text-sm font-bold text-fg-muted">Type the 4 digits on the rider’s pass</p>
        <p className="mt-1 text-center text-5xl font-extrabold tracking-wider" aria-label={`Code KW ${digits}`}>
          KW-{digits.padEnd(4, '·')}
        </p>

        <div role="status" aria-live="assertive" className="mt-3 min-h-20">
          {result && (
            <div className={`flex animate-pop items-start gap-3 rounded-2xl px-4 py-3 ${tones[result.tone]}`}>
              <Icon name={toneIcons[result.tone]} size="xl" className="mt-0.5" />
              <div>
                <p className="text-xl leading-tight font-extrabold">{result.title}</p>
                <p className="mt-0.5">{result.detail}</p>
              </div>
            </div>
          )}
        </div>

        <div className="mt-3 grid grid-cols-3 gap-2">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((d) => (
            <button key={d} type="button" onClick={() => press(d)} className={`${key} text-3xl`}>
              {d}
            </button>
          ))}
          <span />
          <button type="button" onClick={() => press('0')} className={`${key} text-3xl`}>
            0
          </button>
          <button type="button" onClick={erase} aria-label="Delete" className={`${key} grid place-items-center`}>
            <Icon name="erase" size="lg" />
          </button>
        </div>

        <section className="mt-6">
          <h2 className="font-bold">Booked at this stop</h2>
          {here.length === 0 ? (
            <p className="mt-1 text-fg-muted">No one is booked here. You can leave on time.</p>
          ) : (
            <ul className="mt-2 space-y-2">
              {here.map((r) => {
                const boarded = run.boarded[r.code] !== undefined
                return (
                  <li
                    key={r.code}
                    className={`flex min-h-16 items-center gap-3 rounded-2xl border-2 px-4 py-2 ${
                      boarded ? 'border-brand-fg bg-brand-tint' : 'border-line bg-surface'
                    }`}
                  >
                    <span className="flex-1">
                      <span className="block text-lg font-extrabold">{r.name}</span>
                      <span className="block text-sm text-fg-muted">
                        {r.code}
                        {r.catchingUpFrom ? ` · catching up from ${r.catchingUpFrom}` : ''}
                      </span>
                    </span>
                    {boarded ? (
                      <span className="flex items-center gap-1 font-bold text-brand-fg">
                        <Icon name="ok" /> On board
                      </span>
                    ) : (
                      <button
                        type="button"
                        aria-label={`Board ${r.name}`}
                        onClick={() => check(r.code)}
                        className="min-h-12 rounded-xl border-2 border-brand-fg px-4 font-bold text-brand-fg"
                      >
                        Board
                      </button>
                    )}
                  </li>
                )
              })}
            </ul>
          )}
        </section>

        <button type="button" onClick={restart} className="mt-6 min-h-11 text-sm text-fg-muted underline">
          Prototype: restart this run
        </button>
      </main>

      <footer className="sticky bottom-0 border-t border-line bg-canvas px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        {confirming ? (
          <div>
            <p className="font-bold">
              {waiting.length} not here: {waiting.map((r) => r.name).join(', ')}
            </p>
            <p className="text-sm text-fg-muted">They will be told the bus has left, with their options.</p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setConfirming(false)}
                className="min-h-16 rounded-2xl border border-outline bg-surface text-lg font-bold"
              >
                Wait
              </button>
              <button type="button" onClick={leave} className="min-h-16 rounded-2xl bg-danger text-lg font-bold text-on-danger">
                Leave now
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => (waiting.length > 0 ? setConfirming(true) : leave())}
            className="min-h-16 w-full rounded-2xl bg-brand text-lg font-bold text-on-brand"
          >
            {run.at >= lastBoardingIdx ? 'Finish run' : `Leave ${stop.name}`}
            {waiting.length > 0 ? ` · ${waiting.length} not here` : ''}
          </button>
        )}
      </footer>
    </div>
  )
}

const key =
  'min-h-16 rounded-2xl border border-outline bg-surface font-extrabold text-fg active:bg-brand-tint active:border-brand-fg'
