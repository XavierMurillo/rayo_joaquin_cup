import React, { useEffect, useRef, useState } from 'react'
import { drawStorageKey, drawTeam, loadDraw, storeDraw } from './roulette.js'

const spinDuration = 1000
const colors = ['#edede8', '#393939', '#cc463e', '#646464', '#beaa81', '#282828']

function Wheel({ teams, rotation, spinning }) {
  const count = teams.length
  const segmentColors = teams.map(({ color }, index) =>
    /^#[0-9a-f]{6}$/i.test(color ?? '') ? color : colors[index % colors.length],
  )
  const segments = teams.map((team, index) =>
    `${segmentColors[index]} ${index * 100 / count}% ${(index + 1) * 100 / count}%`,
  )
  const background = count > 1 ? `conic-gradient(${segments.join(',')})` : segmentColors[0]
  return (
    <div className="roulette-wheel-frame" aria-hidden="true">
      <div className={spinning ? 'roulette-wheel is-spinning' : 'roulette-wheel'} style={{ background, transform: `rotate(${rotation}deg)` }}>
        {count <= 12 && teams.map(({ id, name }, index) => {
          const angle = (index + 0.5) / count * 2 * Math.PI
          const radius = count === 1 ? 0 : 32
          return (
            <span key={id} style={{
              top: `${50 - Math.cos(angle) * radius}%`,
              left: `${50 + Math.sin(angle) * radius}%`,
            }}>{name}</span>
          )
        })}
      </div>
    </div>
  )
}

function ChallengeDraw({ storageKey, teams, onSpinning, onSave, savedOrder }) {
  const [draw, setDraw] = useState(() => loadDraw(storageKey))
  const [wheelTeams, setWheelTeams] = useState(null)
  const [rotation, setRotation] = useState(0)
  const [spinning, setSpinning] = useState(false)
  const [resetting, setResetting] = useState(false)
  const [storageError, setStorageError] = useState(false)
  const [saveMessage, setSaveMessage] = useState('')
  const timer = useRef(null)
  const remaining = draw?.remaining ?? teams
  const order = spinning ? draw.order.slice(0, -1) : draw?.order ?? []
  const complete = !spinning && draw && remaining.length === 0

  useEffect(() => () => clearTimeout(timer.current), [])

  function spin() {
    if (timer.current !== null || resetting) return
    const result = drawTeam(draw, teams)
    if (!result) return
    setStorageError(!storeDraw(storageKey, result.draw))
    setDraw(result.draw)
    setWheelTeams(result.candidates)
    const angle = (result.index + 0.5) * 360 / result.candidates.length
    const target = (360 - angle) % 360
    const offset = (target - rotation % 360 + 360) % 360
    setRotation(rotation + 3 * 360 + offset)

    if (globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return
    setSpinning(true)
    onSpinning(true)
    timer.current = setTimeout(() => {
      timer.current = null
      setSpinning(false)
      onSpinning(false)
    }, spinDuration)
  }

  function reset() {
    setStorageError(!storeDraw(storageKey, null))
    setDraw(null)
    setWheelTeams(null)
    setRotation(0)
    setResetting(false)
    setSaveMessage('')
  }

  function save() {
    if (!complete || resetting) return
    setSaveMessage(onSave(draw) ? 'Order saved to the challenge card.' : 'Could not save the order in this browser.')
  }

  return (
    <div className="roulette-layout">
      <div>
        {(wheelTeams ?? remaining).length > 0 && <Wheel teams={wheelTeams ?? remaining} rotation={rotation} spinning={spinning} />}
        {!draw && teams.length === 0 && <p>Add a team to the edition to start a draw.</p>}
        <div className="roulette-controls">
          <button type="button" disabled={spinning || resetting || !remaining.length} onClick={spin}>Spin</button>
          {draw && <button type="button" disabled={spinning || resetting} onClick={() => setResetting(true)}>Reset order</button>}
          {complete && (
            <button type="button" disabled={resetting} onClick={save}>{savedOrder ? 'Save as replacement' : 'Save order'}</button>
          )}
        </div>
        {resetting && (
          <div className="notice">
            <p>Clear this challenge’s order and start again with the current roster?</p>
            <div className="roulette-controls">
              <button type="button" onClick={() => setResetting(false)}>Cancel</button>
              <button type="button" onClick={reset}>Confirm reset</button>
            </div>
          </div>
        )}
      </div>
      <div>
        <h4>Running order</h4>
        <p role="status" aria-atomic="true">
          {spinning ? 'Drawing the next team…' : order.length > 0
            ? `Drawn: ${order.at(-1).name}.${complete ? ' Order complete.' : ''}`
            : 'No teams drawn yet.'}
        </p>
        {order.length > 0 && <ol>{order.map((team) => <li key={team.id}>{team.name}</li>)}</ol>}
        <p>{remaining.length + (spinning ? 1 : 0)} remaining</p>
        {saveMessage && <p role="status">{saveMessage}</p>}
        {storageError && <p role="alert">Browser storage is unavailable. This order may not survive a reload.</p>}
      </div>
    </div>
  )
}

export function TeamRoulette({ editionId, challenges, teams, savedOrders, onSave }) {
  const [selected, setSelected] = useState(challenges[0].id)
  const [spinning, setSpinning] = useState(false)
  return (
    <section className="panel team-roulette" aria-labelledby="roulette-title">
      <h3 id="roulette-title">Team roulette</h3>
      <label htmlFor="roulette-challenge">Challenge</label>
      <select id="roulette-challenge" value={selected} disabled={spinning} onChange={(event) => setSelected(event.target.value)}>
        {challenges.map(({ id, challenge }, index) => (
          <option key={id} value={id}>Challenge {index + 1} — {challenge.name}</option>
        ))}
      </select>
      {challenges.map(({ id }) => {
        const key = drawStorageKey(editionId, id)
        return (
          <div key={key} hidden={id !== selected}>
            <ChallengeDraw
              storageKey={key}
              teams={teams}
              onSpinning={setSpinning}
              savedOrder={savedOrders[id]}
              onSave={(draw) => onSave(id, draw)}
            />
          </div>
        )
      })}
    </section>
  )
}
