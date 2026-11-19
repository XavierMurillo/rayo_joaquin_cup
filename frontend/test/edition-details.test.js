import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { act, create } from 'react-test-renderer'
import { createServer } from 'vite'

const editions = JSON.parse(readFileSync(new URL('../../backend/editions.json', import.meta.url), 'utf8'))
const vite = await createServer({ logLevel: 'silent', server: { middlewareMode: true, hmr: false } })
const [{ EditionDetails }, { TeamRoster }] = await Promise.all([
  vite.ssrLoadModule('/src/EditionDetails.jsx'),
  vite.ssrLoadModule('/src/TeamRoster.jsx'),
]).finally(() => vite.close())

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

test('shows the empty Teams state and renders a named thumbnail button', () => {
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
  for (const text of [team.name, `src="${team.photoUrl}"`, 'aria-haspopup="dialog"']) {
    assert.ok(markup.includes(text), text)
  }
  assert.doesNotMatch(markup, /Team details are not available yet/)
  assert.ok(!markup.includes(team.description))
})

test('puts the custom background and contrasting text on the roster tile', () => {
  const edition = editions.find(({ id }) => id === 'iii')
  const team = { id: 'fixture', name: 'Fixture Team', photoUrl: '/fixture.webp', photoAlt: 'Vehicle' }
  for (const [color, foreground] of [['#1930dd', '#fff'], ['#ffff00', '#000']]) {
    const markup = render({ ...edition, teams: [{ ...team, color }] })
    assert.ok(markup.includes(`class="team-tile" style="background-color:${color};color:${foreground}"`))
  }
})

test('opens a team dialog with the full details and restores focus on close', () => {
  const team = {
    id: 'fixture', name: 'Fixture Team', description: 'Compact test vehicle',
    photoUrl: '/fixture.webp', photoAlt: 'Side view of the test vehicle', color: '#1930dd',
  }
  let opened = false
  let focused = false
  let view
  act(() => {
    view = create(React.createElement(TeamRoster, { teams: [team] }), {
      createNodeMock: (node) => node.type === 'dialog'
        ? { showModal: () => { opened = true } }
        : null,
    })
  })
  const tile = view.root.findByType('button')
  act(() => tile.props.onClick({ currentTarget: { focus: () => { focused = true } } }))
  assert.equal(opened, true)
  const dialog = view.root.findByType('dialog')
  assert.equal(dialog.findByType('h3').children.join(''), team.name)
  assert.equal(dialog.findByType('p').children.join(''), team.description)
  assert.equal(dialog.findByType('img').props.alt, team.photoAlt)
  assert.deepEqual(dialog.findByType('article').props.style, { backgroundColor: team.color, color: '#fff' })
  act(() => dialog.props.onClose())
  assert.equal(view.root.findAllByType('dialog').length, 0)
  assert.equal(focused, true)
  act(() => view.unmount())
})
