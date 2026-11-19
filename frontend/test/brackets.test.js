import assert from 'node:assert/strict'
import { webcrypto } from 'node:crypto'
import { test } from 'node:test'
import { buildBracket, generateBracket, loadBracket, recordWinner, saveBracket } from '../src/brackets.js'

function roster(size) {
  return Array.from({ length: size }, (_, index) => ({ id: String(index), name: `Team ${index + 1}` }))
}

function playable(bracket) {
  return [...bracket.upper, ...bracket.lower, ...bracket.finals]
    .flatMap(({ matches }) => matches)
    .filter(({ teams, winner }) => !winner && teams.every(Boolean))
}

function playToEnd(size, doubleElimination, resetFinal) {
  let state = generateBracket(roster(size), webcrypto)
  const losses = new Map(state.seeds.map(({ id }) => [id, 0]))
  const expectedMatches = doubleElimination ? 2 * (size - 1) + Number(resetFinal) : size - 1
  for (let played = 0; played < expectedMatches; played += 1) {
    const match = playable(buildBracket(state, doubleElimination)).at(-1)
    assert.ok(match, 'Expected a playable match')
    assert.notEqual(match.teams[0].id, match.teams[1].id)
    const chooseLowerFinalist = resetFinal && match.id === 'grand-final-1'
    const [winner, loser] = chooseLowerFinalist ? [...match.teams].reverse() : match.teams
    losses.set(loser.id, losses.get(loser.id) + 1)
    state = recordWinner(state, doubleElimination, match.id, winner.id)
  }

  const result = buildBracket(state, doubleElimination)
  assert.ok(result.champion)
  assert.equal(playable(result).length, 0)
  for (const [id, count] of losses) {
    assert.equal(count, id === result.champion.id ? Number(resetFinal) : (doubleElimination ? 2 : 1))
  }
  return result
}

test('seeds six unique teams with two automatic byes and lets either ready match go first', () => {
  assert.equal(generateBracket([]), null)
  assert.equal(generateBracket(roster(1)), null)
  const teams = roster(6)
  const random = { getRandomValues: (sample) => { sample[0] = 0 } }
  const state = generateBracket(teams, random)
  assert.notDeepEqual(state.seeds.map(({ id }) => id), teams.map(({ id }) => id))
  const bracket = buildBracket(state, false)
  const firstRound = bracket.upper[0].matches
  assert.equal(firstRound.filter(({ teams: pair }) => pair.includes(null)).length, 2)
  assert.deepEqual(firstRound.flatMap(({ teams: pair }) => pair.filter(Boolean).map(({ id }) => id)).sort(),
    teams.map(({ id }) => id).sort())
  const [first, second] = playable(bracket)
  const update = recordWinner(state, false, second.id, second.teams[0].id)
  assert.deepEqual(update.results, { [second.id]: second.teams[0].id })
  assert.ok(playable(buildBracket(update, false)).some(({ id }) => id === first.id))
  assert.equal(recordWinner(update, false, second.id, second.teams[1].id), update)
})

test('finishes single elimination with even and odd rosters', () => {
  for (const size of [2, 3, 6, 9, 16]) playToEnd(size, false, false)
})

test('finishes double elimination with both grand-final paths', () => {
  for (const size of [2, 3, 6, 9, 16]) {
    assert.equal(playToEnd(size, true, false).finals.length, 1)
    assert.equal(playToEnd(size, true, true).finals.at(-1).title, 'Reset final')
  }
})

test('restores recorded results and resets only the selected bracket', (context) => {
  const previous = Object.getOwnPropertyDescriptor(globalThis, 'localStorage')
  const entries = new Map()
  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    value: {
      getItem: (key) => entries.get(key) ?? null,
      setItem: (key, value) => entries.set(key, value),
      removeItem: (key) => entries.delete(key),
    },
  })
  context.after(() => {
    if (previous) Object.defineProperty(globalThis, 'localStorage', previous)
    else delete globalThis.localStorage
  })

  const single = generateBracket(roster(6), webcrypto)
  const double = generateBracket(roster(3), webcrypto)
  const match = playable(buildBracket(single, false))[0]
  const updated = recordWinner(single, false, match.id, match.teams[0].id)
  assert.equal(saveBracket('iii', 'C', updated), true)
  assert.equal(saveBracket('iii', 'D', double), true)
  assert.deepEqual(loadBracket('iii', 'C'), updated)
  assert.equal(loadBracket('ii', 'C'), null)
  assert.equal(saveBracket('iii', 'C', null), true)
  assert.equal(loadBracket('iii', 'C'), null)
  assert.deepEqual(loadBracket('iii', 'D'), double)
})
