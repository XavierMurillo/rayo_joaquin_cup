import React, { useEffect, useRef, useState } from 'react'
import { cardColors, TeamCard } from './TeamCard.jsx'

function TeamDialog({ team, onClose }) {
  const dialog = useRef(null)

  useEffect(() => {
    dialog.current.showModal()
  }, [])

  return (
    <dialog ref={dialog} className="team-dialog" aria-labelledby="team-dialog-title" onClose={onClose}>
      <div className="team-dialog-actions">
        <button type="button" onClick={() => dialog.current.close()}>Close</button>
      </div>
      <TeamCard team={team} headingId="team-dialog-title" />
    </dialog>
  )
}

export function TeamRoster({ teams }) {
  const [selected, setSelected] = useState(null)
  const opener = useRef(null)

  function close() {
    setSelected(null)
    opener.current?.focus()
  }

  return (
    <>
      <ul className="team-grid">
        {teams.map((team) => (
          <li key={team.id}>
            <button
              type="button"
              className="team-tile"
              style={cardColors(team.color)}
              aria-haspopup="dialog"
              onClick={(event) => {
                opener.current = event.currentTarget
                setSelected(team)
              }}
            >
              <span className="team-card-media">
                <img className="team-photo" src={team.photoUrl} alt="" loading="lazy" />
              </span>
              <span className="team-tile-name">{team.name}</span>
            </button>
          </li>
        ))}
      </ul>
      {selected && <TeamDialog team={selected} onClose={close} />}
    </>
  )
}
