import { randomIndex } from './roulette.js'

export function generateBracket(teams, random) {
  if (teams.length < 2) return null
  const seeds = teams.map(({ id, name, color }) => ({ id, name, color: color ?? null }))
  for (let index = seeds.length - 1; index > 0; index -= 1) {
    const swap = randomIndex(index + 1, random)
    const team = seeds[index]
    seeds[index] = seeds[swap]
    seeds[swap] = team
  }
  return { seeds, results: {} }
}

export function buildBracket(state, doubleElimination) {
  const size = 2 ** Math.ceil(Math.log2(state.seeds.length))
  const byeCount = size - state.seeds.length
  const byeSlots = new Set(Array.from({ length: byeCount }, (_, index) =>
    Math.floor(index * (size / 2) / byeCount),
  ))
  let seed = 0
  const slots = Array.from({ length: size / 2 }, (_, index) => {
    const first = state.seeds[seed++]
    return [first, byeSlots.has(index) ? null : state.seeds[seed++]]
  })
  const upper = []
  const lower = []
  const finals = []

  function round(group, prefix, title, pairs) {
    const matches = pairs.map(([first, second], index) => {
      const id = `${prefix}-${index + 1}`
      let winner
      let loser
      if (first !== undefined && second !== undefined) {
        if (!first || !second) {
          winner = first ?? second
          loser = null
        } else if (state.results[id] === first.id || state.results[id] === second.id) {
          winner = state.results[id] === first.id ? first : second
          loser = winner === first ? second : first
        }
      }
      return { id, teams: [first, second], winner, loser }
    })
    group.push({ title, matches })
    return matches
  }

  function pair(items) {
    return Array.from({ length: items.length / 2 }, (_, index) => items.slice(index * 2, index * 2 + 2))
  }

  let previous = round(upper, 'upper-1', 'Round 1', slots)
  while (previous.length > 1) {
    const number = upper.length + 1
    previous = round(upper, `upper-${number}`, `Round ${number}`, pair(previous.map(({ winner }) => winner)))
  }
  const upperFinal = previous[0]
  if (!doubleElimination) return { upper, lower, finals, champion: upperFinal.winner }

  let lowerWinners = [upperFinal.loser]
  if (upper.length > 1) {
    let number = 1
    lowerWinners = round(lower, 'lower-1', 'Round 1',
      pair(upper[0].matches.map(({ loser }) => loser))).map(({ winner }) => winner)

    for (const [index, upperRound] of upper.slice(1).entries()) {
      number += 1
      const incoming = upperRound.matches.map(({ loser }) => loser)
      const drops = incoming.length > 1 ? incoming.map((_, position) => incoming[position ^ 1]) : incoming
      lowerWinners = round(lower, `lower-${number}`, `Round ${number}`,
        lowerWinners.map((winner, position) => [winner, drops[position]])).map(({ winner }) => winner)
      if (index < upper.length - 2) {
        number += 1
        lowerWinners = round(lower, `lower-${number}`, `Round ${number}`, pair(lowerWinners))
          .map(({ winner }) => winner)
      }
    }
  }

  const lowerFinalist = lowerWinners[0]
  const [grandFinal] = round(finals, 'grand-final', 'Grand final', [[upperFinal.winner, lowerFinalist]])
  let champion = grandFinal.winner
  if (grandFinal.winner && grandFinal.winner === lowerFinalist) {
    const [reset] = round(finals, 'reset-final', 'Reset final', [[upperFinal.winner, lowerFinalist]])
    champion = reset.winner
  }
  return { upper, lower, finals, champion }
}

export function recordWinner(state, doubleElimination, matchId, teamId) {
  const { upper, lower, finals } = buildBracket(state, doubleElimination)
  const match = [...upper, ...lower, ...finals].flatMap(({ matches }) => matches).find(({ id }) => id === matchId)
  if (!match || match.winner || !match.teams.every(Boolean) || !match.teams.some(({ id }) => id === teamId)) return state
  return { ...state, results: { ...state.results, [matchId]: teamId } }
}

function storageKey(editionId, challengeId) {
  return `rayo-joakin-cup:bracket:${editionId}:${challengeId}`
}

export function loadBracket(editionId, challengeId) {
  try {
    const state = JSON.parse(globalThis.localStorage?.getItem(storageKey(editionId, challengeId)) ?? 'null')
    if (!Array.isArray(state?.seeds) || state.seeds.length < 2 || !state.results
      || typeof state.results !== 'object' || Array.isArray(state.results)) return null
    if (!state.seeds.every((team) => typeof team?.id === 'string' && typeof team.name === 'string')) return null
    if (new Set(state.seeds.map(({ id }) => id)).size !== state.seeds.length) return null
    return state
  } catch {
    return null
  }
}

export function saveBracket(editionId, challengeId, state) {
  try {
    const key = storageKey(editionId, challengeId)
    if (state) globalThis.localStorage.setItem(key, JSON.stringify(state))
    else globalThis.localStorage.removeItem(key)
    return true
  } catch {
    return false
  }
}
