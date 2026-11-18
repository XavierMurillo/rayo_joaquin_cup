import React from 'react'
import { createRoot } from 'react-dom/client'
import { useApi } from './api.js'
import { EditionDetails } from './EditionDetails.jsx'
import './styles.css'

function RequestResult({ request, children }) {
  if (request.status === 'loading') return <p role="status">Loading competition data…</p>
  if (request.status === 'missing') return <p role="status">Edition not found.</p>
  if (request.status === 'error') {
    return (
      <div className="notice" role="alert">
        <p>Competition data couldn’t be loaded.</p>
        <button onClick={request.retry}>Retry</button>
      </div>
    )
  }
  return children(request.data)
}

function EditionSelector() {
  const request = useApi('/api/editions')
  return (
    <>
      <div className="hero">
        <p className="eyebrow">Embedded Systems II</p>
        <h1>Rayo Joakin <em>Cup</em></h1>
      </div>
      <section aria-labelledby="edition-heading">
        <h2 id="edition-heading">Select an edition</h2>
        <RequestResult request={request}>
          {(editions) => (
            <ul className="edition-grid">
              {editions.map((edition) => (
                <li key={edition.id}>
                  <a className="edition-link" href={`/editions/${edition.id}`}>
                    <strong>{edition.label}</strong>
                    <span>{edition.term}</span>
                    <span className="edition-arrow" aria-hidden="true">→</span>
                  </a>
                </li>
              ))}
            </ul>
          )}
        </RequestResult>
      </section>
    </>
  )
}

function EditionPage({ editionId }) {
  const request = useApi(`/api/editions/${encodeURIComponent(editionId)}`, { allowMissing: true })
  return (
    <>
      <a className="back-link" href="/">← All editions</a>
      <RequestResult request={request}>
        {(edition) => <EditionDetails edition={edition} />}
      </RequestResult>
    </>
  )
}

function App() {
  const pathname = window.location.pathname
  const edition = /^\/editions\/([a-z]+)\/?$/i.exec(pathname)
  let page = <><h1>Page not found</h1><a href="/">All editions</a></>

  if (pathname === '/') page = <EditionSelector />
  if (edition) page = <EditionPage editionId={edition[1]} />
  return (
    <>
      <a className="skip-link" href="#main">Skip to content</a>
      <header className="site-header"><a href="/">Rayo Joakin Cup</a></header>
      <main id="main" className="shell" tabIndex={-1}>
        {page}
      </main>
    </>
  )
}

createRoot(document.getElementById('root')).render(<App />)
