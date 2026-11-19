import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { act, create } from 'react-test-renderer'
import { createServer } from 'vite'

const editions = JSON.parse(readFileSync(new URL('../../backend/editions.json', import.meta.url), 'utf8'))
const vite = await createServer({ logLevel: 'silent', server: { middlewareMode: true, hmr: false } })
const [{ EditionDetails }, { TeamRoster }, { ChallengeList }, { ChallengeWinner }] = await Promise.all([
  vite.ssrLoadModule('/src/EditionDetails.jsx'),
  vite.ssrLoadModule('/src/TeamRoster.jsx'),
  vite.ssrLoadModule('/src/ChallengeList.jsx'),
  vite.ssrLoadModule('/src/ChallengeWinner.jsx'),
]).finally(() => vite.close())

function render(edition) {
  return renderToStaticMarkup(React.createElement(EditionDetails, { edition }))
}

test('opens each challenge with its own instructions, pending details, and illustration', () => {
  const { modules } = editions.find(({ id }) => id === 'iii')
  const savedOrders = { A: [{ id: 'one', name: 'First Team' }, { id: 'two', name: 'Second Team' }] }
  const brackets = { C: { seeds: savedOrders.A, results: { 'upper-1-1': 'two' } } }
  const winners = { B: savedOrders.A[0] }
  let opened = 0
  let focusReturns = 0
  let view
  act(() => {
    view = create(React.createElement(ChallengeList, { modules, savedOrders, brackets, winners }), {
      createNodeMock: (node) => node.type === 'dialog'
        ? { showModal: () => { opened += 1 } }
        : null,
    })
  })

  assert.deepEqual(view.root.findByType('ol').findAllByType('li')
    .map((item) => item.children.join('')), ['First Team', 'Second Team'])
  assert.deepEqual(view.root.findAllByProps({ className: 'challenge-champion' })
    .map((summary) => summary.children.at(-1)), ['First Team', 'Second Team'])

  for (const { id, challenge } of modules) {
    const trigger = view.root.findByProps({ 'aria-label': `View challenge details for ${challenge.name}` })
    act(() => trigger.props.onClick({ currentTarget: { focus: () => { focusReturns += 1 } } }))
    const dialog = view.root.findByType('dialog')
    assert.equal(dialog.findByType('h2').children.join(''), challenge.name)
    assert.deepEqual(dialog.findByProps({ className: 'notice challenge-instruction' }).findAllByType('li')
      .map((item) => item.children.join('')), challenge.pending)
    const runningOrder = dialog.findAllByType('ol')
    assert.equal(runningOrder.length, id === 'A' ? 1 : 0)
    if (id === 'A') {
      assert.deepEqual(runningOrder[0].findAllByType('li')
        .map((item) => item.children.join('')), ['First Team', 'Second Team'])
    }
    const champions = dialog.findAllByProps({ className: 'challenge-champion' })
    assert.equal(champions.length, id === 'B' || id === 'C' ? 1 : 0)
    if (id === 'B') assert.equal(champions[0].children.at(-1), 'First Team')
    if (id === 'C') {
      assert.match(champions[0].children.join(''), /Second Team/)
      assert.equal(dialog.findAllByType('h5').at(-1).children.join(''), 'Winner')
    }
    assert.ok(dialog.findAllByType('h3').some((heading) => heading.children.join('') === 'Awaiting release'))
    const photo = dialog.findByType('img')
    assert.equal(photo.props.src, challenge.visual.src)
    assert.equal(photo.props.alt, challenge.visual.alt)
    assert.match(dialog.findByType('figcaption').children.join(''), /Illustration only/)
    assert.ok(readFileSync(new URL(`../public${challenge.visual.src}`, import.meta.url)).length > 0)
    if (challenge.name === 'Clear the Arena') {
      const instructions = dialog.findAllByType('p').map((item) => item.children.join('')).join(' ')
      assert.match(instructions, /one vehicle in its own arena/)
      assert.match(instructions, /The first team to clear all its targets wins/)
    }
    act(() => dialog.props.onClose())
    assert.equal(view.root.findAllByType('dialog').length, 0)
  }

  assert.equal(opened, 4)
  assert.equal(focusReturns, 4)
  act(() => view.unmount())
})

test('requires an available team and allows canceling or confirming a replacement winner', () => {
  const first = { id: 'first', name: 'First Team' }
  const second = { id: 'second', name: 'Second Team' }
  const updates = []
  const onConfirm = (team) => { updates.push(team); return true }
  let view
  act(() => { view = create(React.createElement(ChallengeWinner, { teams: [], onConfirm })) })
  assert.equal(view.root.findByType('button').props.disabled, true)

  act(() => view.update(React.createElement(ChallengeWinner, { teams: [first, second], winner: first, onConfirm })))
  const click = (label) => act(() => view.root.findAllByType('button')
    .find((button) => button.children.join('') === label).props.onClick())
  click('Change winner')
  act(() => view.root.findByType('select').props.onChange({ target: { value: second.id } }))
  click('Cancel')
  assert.deepEqual(updates, [])
  assert.equal(view.root.findByProps({ role: 'status' }).children.at(-1), first.name)
  click('Change winner')
  act(() => view.root.findByType('select').props.onChange({ target: { value: second.id } }))
  act(() => view.root.findByType('form').props.onSubmit({ preventDefault() {} }))
  assert.deepEqual(updates, [second])
  act(() => view.unmount())
})

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
  assert.deepEqual(dialog.findAllByType('button').map((button) => button.children.join('')), ['Close'])
  assert.equal(dialog.findByType('h3').children.join(''), team.name)
  assert.equal(dialog.findByType('p').children.join(''), team.description)
  assert.equal(dialog.findByType('img').props.alt, team.photoAlt)
  assert.deepEqual(dialog.findByType('article').props.style, { backgroundColor: team.color, color: '#fff' })
  act(() => dialog.props.onClose())
  assert.equal(view.root.findAllByType('dialog').length, 0)
  assert.equal(focused, true)
  act(() => view.unmount())
})

test('prefills the local team edit form and allows canceling edit and deletion', () => {
  const team = {
    id: 'fixture', managed: true, name: 'Fixture Team', description: 'Original details',
    color: '#1930dd', photoUrl: '/fixture.webp', photoAlt: 'Vehicle',
  }
  let view
  act(() => {
    view = create(React.createElement(TeamRoster, { editionId: 'iii', teams: [team] }), {
      createNodeMock: (node) => node.type === 'dialog' ? { showModal() {} } : null,
    })
  })
  const click = (label) => act(() => view.root.findAllByType('button')
    .find((button) => button.children.join('') === label).props.onClick({ currentTarget: {} }))
  act(() => view.root.findByProps({ className: 'team-tile' }).props.onClick({ currentTarget: {} }))
  click('Edit team')
  assert.equal(view.root.findByProps({ name: 'name' }).props.value, team.name)
  assert.equal(view.root.findByProps({ name: 'description' }).props.value, team.description)
  assert.equal(view.root.findByProps({ type: 'color' }).props.value, team.color)
  assert.equal(view.root.findByProps({ name: 'photo' }).props.required, false)
  click('Cancel')
  click('Delete team')
  assert.ok(view.root.findAllByType('h3').some((heading) => heading.children.join('') === 'Delete Fixture Team?'))
  click('Cancel')
  assert.equal(view.root.findByType('h3').children.join(''), team.name)
  act(() => view.unmount())
})
