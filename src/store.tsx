import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import type { PlanId, TripId } from './data'

export type Draft = {
  routeId?: string
  homeId?: string
  workId?: string
  trip: TripId
  plan: PlanId
}

export type Pass = {
  routeId: string
  homeId: string
  workId: string
  trip: TripId
  plan: PlanId
  rides: number
  ridesLeft: number
  /** Missed rides the rider can still put back on this pass. */
  savesLeft: number
  total: number
  paidWith: string
  code: string
  startsOn: string
  endsOn: string
}

/**
 * The prototype has no clock or live buses, so a tester picks the moment to look at.
 * before: any time before the first ride day. soon: ten minutes before the bus.
 * left: the bus has just left the rider's stop. gone: the bus has finished its run.
 */
export type Scenario = 'before' | 'soon' | 'left' | 'gone'

/** What happened to today's ride: the rider's choice after missing the bus, or the driver checking them in. */
export type Outcome = { kind: 'catch'; stopId: string } | { kind: 'saved' } | { kind: 'used' } | { kind: 'aboard' }

type State = {
  name: string
  phone: string
  draft: Draft
  pass: Pass | null
  scenario: Scenario
  outcome: Outcome | null
}

const KEY = 'kwan-prototype-v2'
const empty: State = {
  name: '',
  phone: '',
  draft: { trip: 'both', plan: 'week' },
  pass: null,
  scenario: 'before',
  outcome: null,
}

function load(): State {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? { ...empty, ...JSON.parse(raw) } : empty
  } catch {
    return empty
  }
}

type Store = {
  state: State
  update: (patch: Partial<State>) => void
  updateDraft: (patch: Partial<Draft>) => void
  reset: () => void
}

const Ctx = createContext<Store | null>(null)

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State>(load)

  // The pass is kept on the phone so the boarding code opens with no network.
  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(state))
    } catch {
      // Storage can be blocked in private windows; the prototype still works for the session.
    }
  }, [state])

  const update = useCallback((patch: Partial<State>) => setState((s) => ({ ...s, ...patch })), [])
  const updateDraft = useCallback(
    (patch: Partial<Draft>) => setState((s) => ({ ...s, draft: { ...s.draft, ...patch } })),
    [],
  )
  const reset = useCallback(() => setState(empty), [])

  return <Ctx.Provider value={{ state, update, updateDraft, reset }}>{children}</Ctx.Provider>
}

export function useStore() {
  const store = useContext(Ctx)
  if (!store) throw new Error('useStore must be used inside StoreProvider')
  return store
}

export function useOnline() {
  const [online, setOnline] = useState(() => navigator.onLine)
  useEffect(() => {
    const on = () => setOnline(true)
    const off = () => setOnline(false)
    window.addEventListener('online', on)
    window.addEventListener('offline', off)
    return () => {
      window.removeEventListener('online', on)
      window.removeEventListener('offline', off)
    }
  }, [])
  return online
}
