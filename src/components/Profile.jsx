import { useState } from 'react'
import { COLORS, cleanName, initialsOf } from '../game/profile.js'

export default function Profile({ profile, onSave, onClose }) {
  const [name, setName] = useState(profile?.name ?? '')
  const [color, setColor] = useState(profile?.color ?? COLORS[0])
  const clean = cleanName(name)
  const valid = clean.length >= 2

  function submit(e) {
    e.preventDefault()
    if (!valid) return
    onSave({ name: clean, color })
  }

  return (
    <div className="sheet-wrap" role="dialog" aria-modal="true" aria-label="Your profile">
      <form className="sheet" onSubmit={submit}>
        <h2 className="sheet-h">{profile ? 'Edit your profile' : 'Pick a name'}</h2>
        <p className="sheet-p">
          This is how you show up on the leaderboard everyone else can see.
        </p>

        <div className="avatar-row">
          <span className="avatar big" style={{ background: color }}>
            {initialsOf(clean || '??')}
          </span>
          <input
            className="search sheet-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            maxLength={18}
            autoFocus
          />
        </div>

        <div className="swatches">
          {COLORS.map((c) => (
            <button
              key={c}
              type="button"
              className={`swatch${c === color ? ' on' : ''}`}
              style={{ background: c }}
              onClick={() => setColor(c)}
              aria-label={`Colour ${c}`}
            />
          ))}
        </div>

        <div className="sheet-actions">
          <button className="btn" type="submit" disabled={!valid}>
            {profile ? 'SAVE' : 'START PLAYING'}
          </button>
          {profile && (
            <button className="btn ghost" type="button" onClick={onClose}>
              CANCEL
            </button>
          )}
        </div>
      </form>
    </div>
  )
}
