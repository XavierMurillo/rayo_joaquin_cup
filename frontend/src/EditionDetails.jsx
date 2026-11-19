import React, { useRef, useState } from 'react'
import { ChallengeList } from './ChallengeList.jsx'
import { ChallengeBrackets } from './ChallengeBrackets.jsx'
import { loadBracket, saveBracket } from './brackets.js'
import { TeamForm } from './TeamForm.jsx'
import { TeamRoster } from './TeamRoster.jsx'
import { TeamRoulette } from './TeamRoulette.jsx'
import { loadSavedOrder, savedOrderKey, storeDraw } from './roulette.js'

function TeamsSection({ editionId, teams, setTeams }) {
  const [adding, setAdding] = useState(false)
  const [message, setMessage] = useState('')
  const addButton = useRef(null)
  const section = useRef(null)

  function onCreated(team) {
    setTeams((current) => [...current, team])
    setAdding(false)
    setMessage(`${team.name} was added.`)
  }

  function onUpdated(team) {
    setTeams((current) => current.map((item) => item.id === team.id ? team : item))
  }

  function onDeleted(team) {
    setTeams((current) => current.filter((item) => item.id !== team.id))
    setMessage(`${team.name} was deleted.`)
  }

  return (
    <section className="detail-section teams-section" id="teams" tabIndex={-1} ref={section}>
      <div className="teams-heading">
        <h2>Teams</h2>
        {!adding && (
          <button ref={addButton} type="button" onClick={() => { setMessage(''); setAdding(true) }}>Add team</button>
        )}
      </div>
      {adding && (
        <TeamForm editionId={editionId} onSaved={onCreated} onCancel={() => setAdding(false)} />
      )}
      {message && <p role="status">{message}</p>}
      {teams.length === 0 ? (
        <p>Team details are not available yet.</p>
      ) : (
        <TeamRoster
          editionId={editionId}
          teams={teams}
          onUpdated={onUpdated}
          onDeleted={onDeleted}
          focusFallback={() => (addButton.current ?? section.current)?.focus()}
        />
      )}
    </section>
  )
}

export function EditionDetails({ edition }) {
  const [teams, setTeams] = useState(() => edition.teams ?? [])
  const [savedOrders, setSavedOrders] = useState(() => Object.fromEntries(
    (edition.modules ?? []).map(({ id }) => [id, loadSavedOrder(edition.id, id)]),
  ))
  const [brackets, setBrackets] = useState(() => edition.id === 'iii' ? {
    C: loadBracket(edition.id, 'C'), D: loadBracket(edition.id, 'D'),
  } : {})
  const [bracketChallenge, setBracketChallenge] = useState('C')
  if (edition.status === 'unavailable') {
    return (
      <section className="hero">
        <p className="eyebrow">{edition.term}</p>
        <h1>{edition.label}</h1>
        <p>Edition details unavailable.</p>
      </section>
    )
  }

  const rouletteChallenges = edition.id === 'iii'
    ? edition.modules.filter(({ id, challenge }) => challenge && (id === 'A' || id === 'B'))
    : []
  const bracketChallenges = edition.id === 'iii'
    ? edition.modules.filter(({ id, challenge }) => challenge && (id === 'C' || id === 'D'))
    : []

  function updateBracket(challengeId, state) {
    setBrackets((current) => ({ ...current, [challengeId]: state }))
    return saveBracket(edition.id, challengeId, state)
  }

  function saveOrder(challengeId, draw) {
    if (!storeDraw(savedOrderKey(edition.id, challengeId), draw)) return false
    setSavedOrders((current) => ({ ...current, [challengeId]: draw.order }))
    return true
  }

  return (
    <>
      <div className="hero">
        <p className="eyebrow">{edition.course}</p>
        <h1>{edition.title}</h1>
        <p>{edition.date} · Room {edition.room}</p>
      </div>
      <nav className="section-nav" aria-label="Edition sections">
        <a href="#overview">Overview</a>
        <a href="#challenges">Challenges</a>
        <a href="#teams">Teams</a>
        <a href="#evaluation">Evaluation</a>
      </nav>
      <section className="detail-section" id="overview">
        <h2>Overview</h2>
        <p>{edition.overview}</p>
      </section>
      <section className="detail-section" id="challenges">
        <h2>Challenges</h2>
        <p><strong>Platform:</strong> {edition.platform}</p>
        <p>All four modules must be integrated, tested, and ready to run.</p>
        <ChallengeList
          modules={edition.modules}
          savedOrders={savedOrders}
          brackets={brackets}
          onChooseBracket={bracketChallenges.length === 2 ? setBracketChallenge : undefined}
        />
      </section>
      <TeamsSection editionId={edition.id} teams={teams} setTeams={setTeams} />
      <section className="detail-section evaluation-section" id="evaluation">
        <h2>Evaluation</h2>
        <ul className="criteria">
          {edition.criteria.map((criterion) => <li key={criterion}>{criterion}</li>)}
        </ul>
        <div className="notice">
          <h3>Event-day announcements</h3>
          <p>{edition.announcements}</p>
        </div>
        {rouletteChallenges.length === 2 && (
          <TeamRoulette
            editionId={edition.id}
            challenges={rouletteChallenges}
            teams={teams}
            savedOrders={savedOrders}
            onSave={saveOrder}
          />
        )}
        {bracketChallenges.length === 2 && (
          <ChallengeBrackets
            challenges={bracketChallenges}
            teams={teams}
            brackets={brackets}
            selected={bracketChallenge}
            onSelect={setBracketChallenge}
            onUpdate={updateBracket}
          />
        )}
      </section>
    </>
  )
}
