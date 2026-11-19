import React, { useRef, useState } from 'react'
import { ChallengeList } from './ChallengeList.jsx'
import { TeamForm } from './TeamForm.jsx'
import { TeamRoster } from './TeamRoster.jsx'

function TeamsSection({ editionId, teams }) {
  const [adding, setAdding] = useState(false)
  const [visibleTeams, setVisibleTeams] = useState(teams)
  const [message, setMessage] = useState('')
  const addButton = useRef(null)
  const section = useRef(null)

  function onCreated(team) {
    setVisibleTeams((current) => [...current, team])
    setAdding(false)
    setMessage(`${team.name} was added.`)
  }

  function onUpdated(team) {
    setVisibleTeams((current) => current.map((item) => item.id === team.id ? team : item))
  }

  function onDeleted(team) {
    setVisibleTeams((current) => current.filter((item) => item.id !== team.id))
    setMessage(`${team.name} was deleted.`)
  }

  return (
    <section className="detail-section" id="teams" tabIndex={-1} ref={section}>
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
      {visibleTeams.length === 0 ? (
        <p>Team details are not available yet.</p>
      ) : (
        <TeamRoster
          editionId={editionId}
          teams={visibleTeams}
          onUpdated={onUpdated}
          onDeleted={onDeleted}
          focusFallback={() => (addButton.current ?? section.current)?.focus()}
        />
      )}
    </section>
  )
}

export function EditionDetails({ edition }) {
  if (edition.status === 'unavailable') {
    return (
      <section className="hero">
        <p className="eyebrow">{edition.term}</p>
        <h1>{edition.label}</h1>
        <p>Edition details unavailable.</p>
      </section>
    )
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
        <ChallengeList modules={edition.modules} />
      </section>
      <TeamsSection editionId={edition.id} teams={edition.teams ?? []} />
      <section className="detail-section" id="evaluation">
        <h2>Evaluation</h2>
        <ul className="criteria">
          {edition.criteria.map((criterion) => <li key={criterion}>{criterion}</li>)}
        </ul>
        <div className="notice">
          <h3>Event-day announcements</h3>
          <p>{edition.announcements}</p>
        </div>
      </section>
    </>
  )
}
