import type { Leg } from './data'

/**
 * Stop-by-stop progress of the bus, drawn for a dark background.
 * busIdx is the stop the bus is at, or the one it last left; -1 means it has not set off.
 */
export function BusProgress({
  leg,
  yourIdx,
  busIdx,
  busState,
}: {
  leg: Leg
  yourIdx: number
  busIdx: number
  busState: 'at' | 'left'
}) {
  const start = Math.max(0, Math.min(yourIdx, busIdx < 0 ? yourIdx : busIdx) - 1)
  const rows = leg.stops.slice(start, leg.alightIdx + 1)

  return (
    <ol className="mt-4" aria-label="Where the bus is">
      {rows.map((stop, i) => {
        const idx = start + i
        const here = idx === busIdx
        const passed = idx < busIdx || (here && busState === 'left')
        const tags = [
          here && (busState === 'at' ? 'Bus is here' : 'Bus has left'),
          idx === yourIdx && 'Your stop',
          idx === leg.alightIdx && 'You get off here',
        ].filter(Boolean) as string[]

        return (
          <li key={stop.id} className="flex gap-3">
            <span className="flex flex-col items-center" aria-hidden="true">
              <span
                className={`mt-1.5 size-3.5 shrink-0 rounded-full border-2 ${
                  here ? 'border-sun bg-sun' : passed ? 'border-white/40 bg-white/40' : 'border-white'
                }`}
              />
              {i < rows.length - 1 && <span className="w-0.5 flex-1 bg-white/25" />}
            </span>
            <span className="flex-1 pb-3">
              <span className="flex items-baseline justify-between gap-2">
                <span className={`font-semibold ${passed && !here ? 'text-white/60' : ''}`}>{stop.name}</span>
                <span className="text-sm text-white/75">{stop.time}</span>
              </span>
              {tags.length > 0 && (
                <span className="mt-1 flex flex-wrap gap-1.5">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                        tag.startsWith('Bus') ? 'bg-sun text-ink' : 'bg-white/15'
                      }`}
                    >
                      {tag}
                    </span>
                  ))}
                </span>
              )}
            </span>
          </li>
        )
      })}
    </ol>
  )
}
