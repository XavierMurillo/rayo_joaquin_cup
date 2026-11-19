import React, { useId, useState } from 'react'

export function ChallengeWinner({ teams, winner, onConfirm }) {
  const selectorId = useId()
  const [editing, setEditing] = useState(false)
  const [selection, setSelection] = useState('')
  const [error, setError] = useState(false)
  const selectedTeam = teams.find(({ id }) => id === selection)

  function confirm(event) {
    event.preventDefault()
    if (!selectedTeam) return
    if (!onConfirm(selectedTeam)) {
      setError(true)
      return
    }
    setEditing(false)
    setError(false)
  }

  return (
    <section className="challenge-winner-controls" aria-label="Challenge winner">
      {winner && <p className="challenge-champion" role="status"><strong>Winner</strong> · {winner.name}</p>}
      {!teams.length && <p>Add a team to the edition to select a winner.</p>}
      {!editing ? (
        <button type="button" disabled={!teams.length} onClick={() => {
          setSelection('')
          setEditing(true)
        }}>{winner ? 'Change winner' : 'Select winner'}</button>
      ) : (
        <form onSubmit={confirm}>
          <label htmlFor={selectorId}>Winning team</label>
          <select id={selectorId} value={selectedTeam?.id ?? ''} onChange={(event) => setSelection(event.target.value)}>
            <option value="">Choose a team</option>
            {teams.map(({ id, name }) => <option key={id} value={id}>{name}</option>)}
          </select>
          <div className="roulette-controls">
            <button type="submit" disabled={!selectedTeam}>Confirm winner</button>
            <button type="button" onClick={() => { setEditing(false); setError(false) }}>Cancel</button>
          </div>
          {error && <p role="alert">Could not save the winner in this browser.</p>}
        </form>
      )}
    </section>
  )
}
