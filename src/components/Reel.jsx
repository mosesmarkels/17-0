import { useEffect, useRef, useState } from 'react'

const ITEM_H = 72
const BLUR_ITEMS = 26

// A slot reel: builds a strip of random values with the real result at the
// bottom, then slides the whole strip up so the result lands in the window.
export default function Reel({ label, accent, pool, value, spinning, duration }) {
  const [strip, setStrip] = useState([value || '?'])
  const [offset, setOffset] = useState(0)
  const [moving, setMoving] = useState(false)
  const raf = useRef(0)

  useEffect(() => {
    if (!spinning) return
    const items = Array.from(
      { length: BLUR_ITEMS },
      () => pool[Math.floor(Math.random() * pool.length)],
    )
    items.push(value)
    setStrip(items)
    setMoving(false)
    setOffset(0)

    // Two frames: one to paint the strip at rest, one to start the slide.
    raf.current = requestAnimationFrame(() => {
      raf.current = requestAnimationFrame(() => {
        setMoving(true)
        setOffset(-(items.length - 1) * ITEM_H)
      })
    })
    return () => cancelAnimationFrame(raf.current)
  }, [spinning, value, pool])

  useEffect(() => {
    if (spinning) return
    // Settled on a result, or reset to the placeholder for the next round.
    setStrip([value || '?'])
    setMoving(false)
    setOffset(0)
  }, [spinning, value])

  return (
    <div className="reel">
      <div className="reel-label" style={{ background: accent }}>{label}</div>
      <div className="reel-win" style={{ borderColor: accent }}>
        <div
          className="reel-strip"
          style={{
            transform: `translateY(${offset}px)`,
            transition: moving
              ? `transform ${duration}ms cubic-bezier(0.13, 0.62, 0.16, 1)`
              : 'none',
          }}
        >
          {strip.map((s, i) => (
            <div className="reel-item" key={i}>{s}</div>
          ))}
        </div>
      </div>
    </div>
  )
}
