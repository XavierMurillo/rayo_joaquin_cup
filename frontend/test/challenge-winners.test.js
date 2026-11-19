import assert from 'node:assert/strict'
import { test } from 'node:test'
import { loadWinner, saveWinner } from '../src/challengeWinners.js'

test('restores independent results and replaces only the selected challenge winner', (context) => {
  const previous = Object.getOwnPropertyDescriptor(globalThis, 'localStorage')
  const rouletteKey = 'rayo-joakin-cup:roulette:iii:A:saved'
  const bracketKey = 'rayo-joakin-cup:bracket:iii:C'
  const entries = new Map([[rouletteKey, 'saved order'], [bracketKey, 'saved bracket']])
  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    value: { getItem: (key) => entries.get(key), setItem: (key, value) => entries.set(key, value) },
  })
  context.after(() => {
    if (previous) Object.defineProperty(globalThis, 'localStorage', previous)
    else delete globalThis.localStorage
  })

  const first = { id: 'first', name: 'First Team' }
  const second = { id: 'second', name: 'Second Team' }
  const third = { id: 'third', name: 'Third Team' }
  assert.equal(loadWinner('iii', 'A'), null)
  assert.equal(saveWinner('iii', 'A', first), true)
  assert.equal(saveWinner('iii', 'B', second), true)
  assert.deepEqual(loadWinner('iii', 'A'), first)
  assert.deepEqual(loadWinner('iii', 'B'), second)
  assert.equal(loadWinner('ii', 'A'), null)
  assert.equal(saveWinner('iii', 'A', third), true)
  assert.deepEqual(loadWinner('iii', 'A'), third)
  assert.deepEqual(loadWinner('iii', 'B'), second)
  assert.equal(entries.get(rouletteKey), 'saved order')
  assert.equal(entries.get(bracketKey), 'saved bracket')
})
