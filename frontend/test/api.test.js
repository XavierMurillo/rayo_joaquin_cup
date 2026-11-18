import assert from 'node:assert/strict'
import { test } from 'node:test'
import React from 'react'
import { act, create } from 'react-test-renderer'
import { useApi } from '../src/api.js'

for (const path of ['/api/editions', '/api/editions/iii']) {
  test(`shows loading, reports failure, and retries ${path}`, async (context) => {
    const requests = []
    const originalFetch = globalThis.fetch
    globalThis.fetch = (url) => new Promise((resolve) => requests.push({ url, resolve }))
    context.after(() => { globalThis.fetch = originalFetch })

    let request
    function Probe() {
      request = useApi(path, { allowMissing: path.endsWith('/iii') })
      return null
    }

    let view
    act(() => { view = create(React.createElement(Probe)) })
    context.after(() => act(() => view.unmount()))
    assert.equal(request.status, 'loading')
    assert.equal(requests[0].url, path)

    await act(async () => requests[0].resolve({ ok: false, status: 503 }))
    assert.equal(request.status, 'error')

    act(() => request.retry())
    assert.equal(request.status, 'loading')
    assert.equal(requests.length, 2)
    assert.equal(requests[1].url, path)

    const data = { id: 'iii' }
    await act(async () => requests[1].resolve({ ok: true, json: async () => data }))
    assert.equal(request.status, 'ready')
    assert.deepEqual(request.data, data)
  })
}
