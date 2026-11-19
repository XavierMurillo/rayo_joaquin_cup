import React, { useEffect, useRef, useState } from 'react'
import { cardColors, TeamCard } from './TeamCard.jsx'
import { TeamForm } from './TeamForm.jsx'

function TeamDialog({ editionId, team, onClose, onUpdated, onDeleted }) {
  const dialog = useRef(null)
  const [mode, setMode] = useState('profile')
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState('')

  async function confirmDelete() {
    if (deleting) return
    setDeleting(true)
    setError('')
    try {
      const response = await fetch(
        `/api/editions/${encodeURIComponent(editionId)}/teams/${encodeURIComponent(team.id)}`,
        { method: 'DELETE' },
      )
      if (!response.ok) {
        const body = await response.json().catch(() => null)
        setError(typeof body?.detail === 'string' ? body.detail : 'Could not delete the team. Try again.')
        return
      }
      dialog.current.close()
      onDeleted(team)
    } catch {
      setError('Could not delete the team. Try again.')
    } finally {
      setDeleting(false)
    }
  }

  useEffect(() => {
    dialog.current.showModal()
  }, [])

  return (
    <dialog
      ref={dialog}
      className="team-dialog"
      aria-label={team.name}
      onClose={onClose}
      onCancel={(event) => { if (deleting) event.preventDefault() }}
    >
      <div className="team-dialog-actions">
        <button type="button" disabled={deleting} onClick={() => dialog.current.close()}>Close</button>
      </div>
      {mode === 'edit' && (
        <TeamForm editionId={editionId} team={team} onCancel={() => setMode('profile')} onSaved={(updated) => {
          onUpdated(updated)
          setMode('profile')
        }} />
      )}
      {mode === 'delete' && (
        <section className="panel">
          <h3>Delete {team.name}?</h3>
          <p>This permanently removes the team and its vehicle photo.</p>
          <div className="team-dialog-controls">
            <button type="button" disabled={deleting} onClick={() => setMode('profile')}>Cancel</button>
            <button type="button" disabled={deleting} onClick={confirmDelete}>{deleting ? 'Deleting…' : 'Confirm delete'}</button>
          </div>
          {error && <p role="alert">{error}</p>}
        </section>
      )}
      {mode === 'profile' && (
        <>
          <TeamCard team={team} />
          {team.managed && (
            <div className="team-dialog-controls">
              <button type="button" onClick={() => setMode('edit')}>Edit team</button>
              <button type="button" onClick={() => { setError(''); setMode('delete') }}>Delete team</button>
            </div>
          )}
        </>
      )}
    </dialog>
  )
}

export function TeamRoster({ editionId, teams, onUpdated, onDeleted, focusFallback }) {
  const [selected, setSelected] = useState(null)
  const opener = useRef(null)

  function close() {
    setSelected(null)
    opener.current?.focus()
  }

  function remove(team) {
    const tile = opener.current?.closest('li')
    const neighbor = tile?.nextElementSibling ?? tile?.previousElementSibling
    const nextButton = neighbor?.querySelector('button')
    opener.current = null
    setSelected(null)
    onDeleted(team)
    if (nextButton) nextButton.focus()
    else focusFallback()
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
      {selected && (
        <TeamDialog
          editionId={editionId}
          team={selected}
          onClose={close}
          onUpdated={(updated) => { setSelected(updated); onUpdated(updated) }}
          onDeleted={remove}
        />
      )}
    </>
  )
}
