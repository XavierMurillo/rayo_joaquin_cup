import React from 'react'

function TeamsSection({ teams }) {
  return (
    <section className="detail-section" id="teams">
      <h2>Teams</h2>
      {teams.length === 0 ? (
        <p>Team details are not available yet.</p>
      ) : (
        <ul className="team-grid">
          {teams.map((team) => (
            <li key={team.id} className="panel team-card">
              <img src={team.photoUrl} alt={team.photoAlt} loading="lazy" />
              <h3>{team.name}</h3>
              <p>{team.description}</p>
            </li>
          ))}
        </ul>
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
      <TeamsSection teams={edition.teams ?? []} />
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
