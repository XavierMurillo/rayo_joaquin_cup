const randomRange = 2 ** 32

export function randomIndex(size, random = globalThis.crypto) {
  if (!Number.isInteger(size) || size < 1 || size > randomRange) {
    throw new RangeError('Invalid team count')
  }
  if (size === 1) return 0
  const limit = randomRange - (randomRange % size)
  const sample = new Uint32Array(1)
  do {
    random.getRandomValues(sample)
  } while (sample[0] >= limit)
  return sample[0] % size
}

export function drawTeam(draw, teams, random) {
  const remaining = draw?.remaining ?? teams.map(({ id, name, color }) => ({ id, name, color: color ?? null }))
  if (remaining.length === 0) return null
  const index = randomIndex(remaining.length, random)
  return {
    index,
    candidates: remaining,
    draw: {
      remaining: remaining.filter((_, position) => position !== index),
      order: [...(draw?.order ?? []), remaining[index]],
    },
  }
}

export function drawStorageKey(editionId, challengeId) {
  return `rayo-joakin-cup:roulette:${editionId}:${challengeId}`
}

export function savedOrderKey(editionId, challengeId) {
  return `${drawStorageKey(editionId, challengeId)}:saved`
}

export function loadSavedOrder(editionId, challengeId) {
  const draw = loadDraw(savedOrderKey(editionId, challengeId))
  return draw?.remaining.length === 0 ? draw.order : null
}

export function loadDraw(key) {
  try {
    const draw = JSON.parse(globalThis.localStorage?.getItem(key) ?? 'null')
    if (!Array.isArray(draw?.remaining) || !Array.isArray(draw.order) || !draw.order.length) return null
    const teams = [...draw.remaining, ...draw.order]
    if (!teams.every((team) => typeof team?.id === 'string' && typeof team?.name === 'string')) return null
    if (new Set(teams.map((team) => team.id)).size !== teams.length) return null
    return draw
  } catch {
    return null
  }
}

export function storeDraw(key, draw) {
  try {
    if (draw) globalThis.localStorage.setItem(key, JSON.stringify(draw))
    else globalThis.localStorage.removeItem(key)
    return true
  } catch {
    return false
  }
}
