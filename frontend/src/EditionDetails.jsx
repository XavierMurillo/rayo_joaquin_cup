import React, { useState } from 'react'
import { TeamForm } from './TeamForm.jsx'
import { TeamRoster } from './TeamRoster.jsx'

function TeamsSection({ editionId, teams }) {
  const [adding, setAdding] = useState(false)
  const [addedTeams, setAddedTeams] = useState([])
  const [message, setMessage] = useState('')
  const visibleTeams = [...teams, ...addedTeams]

  function onCreated(team) {
    setAddedTeams((current) => [...current, team])
    setAdding(false)
    setMessage(`${team.name} was added.`)
  }

  return (
    <section className="detail-section" id="teams">
      <div className="teams-heading">
        <h2>Teams</h2>
        {!adding && (
          <button type="button" onClick={() => { setMessage(''); setAdding(true) }}>Add team</button>
        )}
      </div>
      {adding && (
        <TeamForm editionId={editionId} onCreated={onCreated} onCancel={() => setAdding(false)} />
      )}
      {message && <p role="status">{message}</p>}
      {visibleTeams.length === 0 ? (
        <p>Team details are not available yet.</p>
      ) : (
        <TeamRoster teams={visibleTeams} />
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
        <ul className="module-grid">
          {edition.modules.map((module) => (
            <li key={module.id} className="panel">
              <h3><span className="module-letter">{module.id}</span>{module.title}</h3>
              <p>{module.description}</p>
            </li>
          ))}
        </ul>
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
