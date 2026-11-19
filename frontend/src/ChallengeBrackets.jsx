import React, { useState } from 'react'
import { buildBracket, generateBracket, recordWinner } from './brackets.js'

const formats = { C: 'Single elimination', D: 'Double elimination' }

function BracketMatch({ match, number, active }) {
  return (
    <div className={active ? 'bracket-match bracket-match-active' : 'bracket-match'}>
      <p className="bracket-match-label">Match {number}{active && <span> · Recording result</span>}</p>
      <ul>
        {match.teams.map((team, index) => (
          <li key={index}>
            {/^#[0-9a-f]{6}$/i.test(team?.color ?? '') && (
              <span className="bracket-team-color" style={{ backgroundColor: team.color }} aria-hidden="true" />
            )}
            {team?.name ?? (team === null ? 'Bye' : 'Awaiting result')}
          </li>
        ))}
      </ul>
      {match.winner && (
        <p className="bracket-match-result">
          {match.loser ? 'Winner' : 'Advances by bye'} · {match.winner.name}
        </p>
      )}
    </div>
  )
}

function MatchResultForm({ match, label, onWinner }) {
  const [selection, setSelection] = useState('')
  const matchup = match.teams.map(({ name }) => name).join(' vs. ')
  return (
    <form className="bracket-result-form" onSubmit={(event) => {
      event.preventDefault()
      if (selection) onWinner(match.id, selection)
    }}>
      <p className="bracket-match-label">{label}</p>
      <label htmlFor={`result-${match.id}`}>{matchup}</label>
      <select id={`result-${match.id}`} value={selection} onChange={(event) => setSelection(event.target.value)}>
        <option value="">Choose winner</option>
        {match.teams.map((team) => <option key={team.id} value={team.id}>{team.name}</option>)}
      </select>
      <button type="submit" disabled={!selection}>Confirm winner</button>
    </form>
  )
}

function MatchResults({ ready, selected, onSelect, onWinner }) {
  return (
    <section className="bracket-results">
      <h4>Record match results</h4>
      {ready.length > 1 && (
        <div>
          <label htmlFor="bracket-result-match">Match</label>
          <select id="bracket-result-match" value={selected.match.id} onChange={(event) => onSelect(event.target.value)}>
            {ready.map(({ match, label }) => (
              <option key={match.id} value={match.id}>
                {label} · {match.teams.map(({ name }) => name).join(' vs. ')}
              </option>
            ))}
          </select>
        </div>
      )}
      <MatchResultForm key={selected.match.id} {...selected} onWinner={onWinner} />
    </section>
  )
}

export function BracketView({ state, challengeId, onUpdate }) {
  const [matchId, setMatchId] = useState('')
  const doubleElimination = challengeId === 'D'
  const { upper, lower, finals, champion } = buildBracket(state, doubleElimination)
  const groups = [
    [doubleElimination ? 'Upper bracket' : 'Bracket', upper, !doubleElimination && champion],
    ['Lower bracket', lower, null],
    ['Finals', finals, champion],
  ]
  const ready = onUpdate ? groups.flatMap(([group, rounds]) => rounds.flatMap(({ title, matches }) =>
    matches.flatMap((match, position) => !match.winner && match.teams.every(Boolean)
      ? [{ match, label: `${group} · ${title} · Match ${position + 1}` }]
      : []),
  )) : []
  const selected = ready.find(({ match }) => match.id === matchId) ?? ready[0]
  return (
    <div className="bracket-view">
      {groups.filter(([, rounds]) => rounds.length > 0).map(([title, rounds, finalChampion]) => (
        <section className="bracket-group" key={title}>
          <h4>{title}</h4>
          <div className="bracket-rounds" tabIndex={0} role="region" aria-label={`${title} rounds`}>
            {rounds.map(({ title: roundTitle, matches }, roundIndex) => (
              <section className="bracket-round" key={roundTitle}
                data-incoming={roundIndex > 0}
                data-advance={rounds[roundIndex + 1]?.matches.length < matches.length ? 'merge'
                  : rounds[roundIndex + 1] || finalChampion ? 'next' : undefined}>
                <h5>{roundTitle}</h5>
                <ul className="bracket-match-slots">
                  {matches.map((match, index) => (
                    <li key={match.id} className="bracket-slot">
                      {!match.teams.every((team) => team === null) && (
                        <BracketMatch match={match} number={index + 1} active={match.id === selected?.match.id} />
                      )}
                    </li>
                  ))}
                </ul>
              </section>
            ))}
            {finalChampion && (
              <section className="bracket-round" data-incoming="true">
                <h5>Champion</h5>
                <div className="bracket-match-slots">
                  <div className="bracket-slot">
                    <p className="bracket-match bracket-champion" role="status">{finalChampion.name}</p>
                  </div>
                </div>
              </section>
            )}
          </div>
        </section>
      ))}
      {selected && (
        <MatchResults ready={ready} selected={selected} onSelect={setMatchId} onWinner={(matchId, teamId) => {
          onUpdate(recordWinner(state, doubleElimination, matchId, teamId))
        }} />
      )}
    </div>
  )
}

function BracketControls({ challengeId, teams, state, onUpdate }) {
  const [confirmingReset, setConfirmingReset] = useState(false)
  const [stored, setStored] = useState(true)

  function update(next) {
    setStored(onUpdate(next))
  }

  return (
    <>
      <p>{formats[challengeId]}</p>
      {state ? (
        <>
          {!confirmingReset && <button type="button" onClick={() => setConfirmingReset(true)}>Reset bracket</button>}
          {confirmingReset && (
            <div className="notice">
              <p>Clear this bracket and its recorded results?</p>
              <div className="roulette-controls">
                <button type="button" onClick={() => setConfirmingReset(false)}>Cancel</button>
                <button type="button" onClick={() => { update(null); setConfirmingReset(false) }}>Confirm reset</button>
              </div>
            </div>
          )}
          <BracketView state={state} challengeId={challengeId} onUpdate={confirmingReset ? undefined : update} />
        </>
      ) : (
        <>
          {teams.length < 2 && <p>Add at least two teams to generate a bracket.</p>}
          <button type="button" disabled={teams.length < 2} onClick={() => update(generateBracket(teams))}>Generate bracket</button>
        </>
      )}
      {!stored && <p role="alert">Browser storage is unavailable. This bracket may not survive a reload.</p>}
    </>
  )
}

export function ChallengeBrackets({ challenges, teams, brackets, selected, onSelect, onUpdate }) {
  return (
    <section className="panel team-roulette challenge-brackets" id="challenge-brackets" aria-labelledby="brackets-title">
      <h3 id="brackets-title">Challenge brackets</h3>
      <label htmlFor="bracket-challenge">Challenge</label>
      <select id="bracket-challenge" value={selected} onChange={(event) => onSelect(event.target.value)}>
        {challenges.map(({ id, challenge }, index) => (
          <option key={id} value={id}>Challenge {index + 3} — {challenge.name}</option>
        ))}
      </select>
      <BracketControls
        key={selected}
        challengeId={selected}
        teams={teams}
        state={brackets[selected]}
        onUpdate={(state) => onUpdate(selected, state)}
      />
    </section>
  )
}
