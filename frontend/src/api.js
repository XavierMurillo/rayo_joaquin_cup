import { useEffect, useState } from 'react'

export function useApi(path, { allowMissing = false } = {}) {
  const [attempt, setAttempt] = useState(0)
  const [result, setResult] = useState(null)

  useEffect(() => {
    const controller = new AbortController()

    async function load() {
      try {
        const response = await fetch(path, { signal: controller.signal })
        if (controller.signal.aborted) return
        if (!response.ok) {
          const status = allowMissing && response.status === 404 ? 'missing' : 'error'
          setResult({ path, attempt, status })
          return
        }
        const data = await response.json()
        if (!controller.signal.aborted) setResult({ path, attempt, status: 'ready', data })
      } catch {
        if (!controller.signal.aborted) setResult({ path, attempt, status: 'error' })
      }
    }

    load()
    return () => controller.abort()
  }, [path, attempt, allowMissing])

  return {
    ...(result?.path === path && result.attempt === attempt ? result : { status: 'loading' }),
    retry: () => setAttempt((previous) => previous + 1),
  }
}
