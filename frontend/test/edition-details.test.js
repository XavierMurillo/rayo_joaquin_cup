import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { createServer } from 'vite'

const editions = JSON.parse(readFileSync(new URL('../../backend/editions.json', import.meta.url), 'utf8'))
const vite = await createServer({ logLevel: 'silent', server: { middlewareMode: true, hmr: false } })
const { EditionDetails } = await vite.ssrLoadModule('/src/EditionDetails.jsx')
  .finally(() => vite.close())

function render(edition) {
  return renderToStaticMarkup(React.createElement(EditionDetails, { edition }))
}

test('shows historical edition notices', () => {
  for (const edition of editions.slice(0, 2)) {
    assert.match(render(edition), /Edition details unavailable/)
  }
})

test('shows current competition logistics, challenges, and evaluation', () => {
  const edition = editions.find(({ id }) => id === 'iii')
  const markup = render(edition)
  for (const section of ['Overview', 'Challenges', 'Teams', 'Evaluation']) {
    assert.ok(markup.includes(`<h2>${section}</h2>`))
  }
  for (const text of [edition.title, edition.date, edition.room, ...edition.criteria]) {
    assert.ok(markup.includes(text), text)
  }
  for (const module of edition.modules) {
    assert.ok(markup.includes(module.title.replaceAll('&', '&amp;')), module.title)
  }
  assert.match(markup, /Event-day announcements/)
})

test('shows the empty Teams state and renders supplied vehicle photo metadata', () => {
  const edition = editions.find(({ id }) => id === 'iii')
  assert.match(render({ ...edition, teams: [] }), /Team details are not available yet/)

  const team = {
    id: 'fixture',
    name: 'Fixture Team',
    description: 'Compact test vehicle',
    photoUrl: '/fixture.webp',
    photoAlt: 'Side view of the test vehicle',
  }
  const markup = render({ ...edition, teams: [team] })
  for (const text of [team.name, team.description, `src="${team.photoUrl}"`, `alt="${team.photoAlt}"`]) {
    assert.ok(markup.includes(text), text)
  }
  assert.doesNotMatch(markup, /Team details are not available yet/)
})
