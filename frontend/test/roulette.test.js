import assert from 'node:assert/strict'
import { test } from 'node:test'
import { drawStorageKey, drawTeam, loadDraw, loadSavedOrder, randomIndex, savedOrderKey, storeDraw } from '../src/roulette.js'

const teams = [
  { id: 'one', name: 'First Team', color: '#123456' },
  { id: 'two', name: 'Second Team' },
  { id: 'three', name: 'Third Team' },
]

function randomValues(...values) {
  let calls = 0
  return {
    get calls() { return calls },
    getRandomValues(sample) { sample[0] = values[calls++] },
  }
}

test('gives each index equal representation and rejects the biased tail', () => {
  assert.deepEqual(Array.from({ length: 6 }, (_, value) => randomIndex(3, randomValues(value))), [0, 1, 2, 0, 1, 2])
  const random = randomValues(0xffffffff, 2)
  assert.equal(randomIndex(3, random), 2)
  assert.equal(random.calls, 2)
  assert.equal(randomIndex(1, random), 0)
  assert.equal(random.calls, 2)
})

test('draws without replacement from the captured roster, including team colors', () => {
  assert.equal(drawTeam(null, []), null)
  const first = drawTeam(null, teams, randomValues(1))
  assert.equal(first.candidates[0].color, '#123456')
  const second = drawTeam(first.draw, [], randomValues(0))
  const third = drawTeam(second.draw, [])
  assert.deepEqual(third.draw.order.map(({ id }) => id), ['two', 'one', 'three'])
  assert.equal(drawTeam(third.draw, teams), null)
  assert.deepEqual(drawTeam(null, [teams[2]]).draw.order.map(({ id }) => id), ['three'])
})

test('keeps saved orders independent of resets, challenges, and editions', (context) => {
  const previous = Object.getOwnPropertyDescriptor(globalThis, 'localStorage')
  const values = new Map()
  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    value: {
      getItem: (key) => values.get(key) ?? null,
      setItem: (key, value) => values.set(key, value),
      removeItem: (key) => values.delete(key),
    },
  })
  context.after(() => {
    if (previous) Object.defineProperty(globalThis, 'localStorage', previous)
    else delete globalThis.localStorage
  })

  const drawA = drawStorageKey('iii', 'A')
  const savedA = savedOrderKey('iii', 'A')
  const savedB = savedOrderKey('iii', 'B')
  const first = drawTeam(null, [teams[0]]).draw
  const second = drawTeam(null, [teams[1]]).draw
  const otherChallenge = drawTeam(null, [teams[2]]).draw
  assert.equal(storeDraw(drawA, first), true)
  assert.deepEqual(loadDraw(drawA), first)
  assert.equal(storeDraw(savedA, first), true)
  assert.equal(storeDraw(savedB, otherChallenge), true)
  assert.equal(storeDraw(drawA, null), true)
  assert.equal(loadDraw(drawA), null)
  assert.deepEqual(loadSavedOrder('iii', 'A'), first.order)
  assert.equal(storeDraw(savedA, second), true)
  assert.deepEqual(loadSavedOrder('iii', 'A'), second.order)
  assert.deepEqual(loadSavedOrder('iii', 'B'), otherChallenge.order)
  assert.equal(loadSavedOrder('ii', 'A'), null)
})
