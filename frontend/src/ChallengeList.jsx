import React, { useEffect, useRef, useState } from 'react'
import { BracketView } from './ChallengeBrackets.jsx'
import { buildBracket } from './brackets.js'

function SavedRunningOrder({ order }) {
  if (!order?.length) return null

  return (
    <div className="challenge-saved-order">
      <h4>Saved running order</h4>
      <ol>{order.map((team) => <li key={team.id}>{team.name}</li>)}</ol>
    </div>
  )
}

function WinnerSummary({ team }) {
  return team ? <p className="challenge-champion"><strong>Winner</strong> · {team.name}</p> : null
}

function ChallengeDialog({ challenge, challengeId, savedOrder, bracket, champion, winner, onClose }) {
  const dialog = useRef(null)

  useEffect(() => {
    dialog.current.showModal()
  }, [])

  return (
    <dialog ref={dialog} className="challenge-dialog" aria-labelledby="challenge-dialog-title" onClose={onClose}>
      <div className="team-dialog-actions">
        <button type="button" onClick={() => dialog.current.close()}>Close</button>
      </div>
      <h2 id="challenge-dialog-title">{challenge.name}</h2>
      <WinnerSummary team={winner ?? champion} />
      <div className={challenge.visual ? 'challenge-detail-layout' : undefined}>
        <div>
          {challenge.sections.map(({ heading, text }) => (
            <section key={heading} className="challenge-instruction">
              <h3>{heading}</h3>
              <p>{text}</p>
            </section>
          ))}
          {challenge.pending?.length > 0 && (
            <section className="notice challenge-instruction">
              <h3>Awaiting release</h3>
              <ul>{challenge.pending.map((item) => <li key={item}>{item}</li>)}</ul>
            </section>
          )}
          <SavedRunningOrder order={savedOrder} />
        </div>
        {challenge.visual && (
          <figure className="challenge-visual">
            <figcaption>{challenge.visual.caption}</figcaption>
            <img src={challenge.visual.src} alt={challenge.visual.alt} />
          </figure>
        )}
      </div>
      {bracket && <BracketView state={bracket} challengeId={challengeId} />}
    </dialog>
  )
}

export function ChallengeList({ modules, savedOrders = {}, brackets = {}, winners = {}, onChooseBracket }) {
  const [selected, setSelected] = useState(null)
  const opener = useRef(null)
  const champions = Object.fromEntries(Object.entries(brackets)
    .filter(([, bracket]) => bracket)
    .map(([id, bracket]) => [id, buildBracket(bracket, id === 'D').champion]))

  return (
    <>
      <ul className="module-grid">
        {modules.map(({ id, title, description, challenge }) => (
          <li key={id} className="panel challenge-card">
            <h3><span className="module-letter">{id}</span>{challenge?.name ?? title}</h3>
            {challenge && <p className="challenge-module">{title}</p>}
            <p>{description}</p>
            <WinnerSummary team={winners[id] ?? champions[id]} />
            <SavedRunningOrder order={savedOrders[id]} />
            {onChooseBracket && Object.hasOwn(brackets, id) && (
              <p><a href="#challenge-brackets" onClick={() => onChooseBracket(id)}>Open {challenge.name} bracket</a></p>
            )}
            {challenge && (
              <button
                type="button"
                aria-haspopup="dialog"
                aria-label={`View challenge details for ${challenge.name}`}
                onClick={(event) => {
                  opener.current = event.currentTarget
                  setSelected({ id, challenge })
                }}
              >
                View challenge details
              </button>
            )}
          </li>
        ))}
      </ul>
      {selected && (
        <ChallengeDialog challenge={selected.challenge} challengeId={selected.id}
          savedOrder={savedOrders[selected.id]} bracket={brackets[selected.id]}
          champion={champions[selected.id]} winner={winners[selected.id]} onClose={() => {
          setSelected(null)
          opener.current?.focus()
        }} />
      )}
    </>
  )
}
