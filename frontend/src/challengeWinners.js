function winnerKey(editionId, challengeId) {
  return `rayo-joakin-cup:winner:${editionId}:${challengeId}`
}

export function loadWinner(editionId, challengeId) {
  try {
    const team = JSON.parse(globalThis.localStorage?.getItem(winnerKey(editionId, challengeId)) ?? 'null')
    return typeof team?.id === 'string' && typeof team.name === 'string' ? team : null
  } catch {
    return null
  }
}

export function saveWinner(editionId, challengeId, { id, name }) {
  try {
    globalThis.localStorage.setItem(winnerKey(editionId, challengeId), JSON.stringify({ id, name }))
    return true
  } catch {
    return false
  }
}
