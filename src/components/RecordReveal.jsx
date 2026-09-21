import { useEffect, useRef, useState } from 'react'

const STRIP_LEN = 24
const WINS_MS = 2400
const LOSSES_MS = 3300

function prefersReducedMotion() {
  try {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  } catch {
    return false
  }
}

// One half of the record. Builds a strip of plausible win totals with the real
// number at the bottom, then slides the strip up so the result lands in frame.
function Half({ final, duration, onLand }) {
  const [strip, setStrip] = useState([final])
  const [index, setIndex] = useState(0)
  const [moving, setMoving] = useState(false)
  const [landed, setLanded] = useState(false)
  const land = useRef(onLand)
  land.current = onLand

  useEffect(() => {
    const items = Array.from({ length: STRIP_LEN }, () =>
      Math.floor(Math.random() * 18),
    )
    items.push(final)
    setStrip(items)
    setIndex(0)
    setMoving(false)
    setLanded(false)

    // Two frames: one to paint the strip at rest, one to start the slide.
    let raf2 = 0
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => {
        setMoving(true)
        setIndex(items.length - 1)
      })
    })
    const t = setTimeout(() => {
      setLanded(true)
      land.current?.()
    }, duration + 60)

    return () => {
      cancelAnimationFrame(raf1)
      cancelAnimationFrame(raf2)
      clearTimeout(t)
    }
  }, [final, duration])

  return (
    <div className={`rec-reel${landed ? ' landed' : ''}`}>
      <div
        className="rec-strip"
        style={{
          transform: `translateY(calc(var(--rec-h) * -${index}))`,
          transition: moving
            ? `transform ${duration}ms cubic-bezier(0.11, 0.66, 0.13, 1)`
            : 'none',
        }}
      >
        {strip.map((n, i) => (
          <div className="rec-item" key={i}>{n}</div>
        ))}
      </div>
    </div>
  )
}

export default function RecordReveal({ wins, losses, perfect, onDone }) {
  const quick = prefersReducedMotion()
  const winsMs = quick ? 0 : WINS_MS
  const lossesMs = quick ? 0 : LOSSES_MS
  const [winsDown, setWinsDown] = useState(false)

  return (
    <div className={`reveal${perfect ? ' perfect' : ''}`}>
      <div className="record-reels">
        <Half final={wins} duration={winsMs} onLand={() => setWinsDown(true)} />
        <div className={`rec-dash${winsDown ? ' in' : ''}`}>–</div>
        <Half final={losses} duration={lossesMs} onLand={onDone} />
      </div>
    </div>
  )
}
