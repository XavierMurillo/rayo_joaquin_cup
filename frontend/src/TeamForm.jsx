import React, { useEffect, useRef, useState } from 'react'
import { TeamCard } from './TeamCard.jsx'

const defaultColor = '#1b1b1b'
const photoTypes = ['image/jpeg', 'image/png', 'image/webp']
const maxPhotoBytes = 5 * 1024 * 1024

export function TeamForm({ editionId, onCreated, onCancel }) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [photo, setPhoto] = useState(null)
  const [preview, setPreview] = useState('')
  const [color, setColor] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const requestId = useRef(null)

  useEffect(() => {
    if (!photo) return
    const url = URL.createObjectURL(photo)
    setPreview(url)
    return () => URL.revokeObjectURL(url)
  }, [photo])

  function choosePhoto(event) {
    const file = event.target.files[0]
    setPhoto(null)
    if (!file) return
    if ((file.type && !photoTypes.includes(file.type)) || file.size > maxPhotoBytes) {
      setError('Choose a JPEG, PNG, or WebP photo up to 5 MiB.')
      event.target.value = ''
      return
    }
    setError('')
    setPhoto(file)
  }

  async function submit(event) {
    event.preventDefault()
    if (saving) return
    const data = new FormData(event.currentTarget)
    if (!data.get('name').trim() || !photo) {
      setError('Enter a team name and choose a vehicle photo.')
      return
    }
    requestId.current ??= crypto.randomUUID()
    data.set('request_id', requestId.current)
    data.set('color', color)
    setSaving(true)
    setError('')
    try {
      const response = await fetch(`/api/editions/${encodeURIComponent(editionId)}/teams`, {
        method: 'POST',
        body: data,
      })
      if (!response.ok) {
        const body = await response.json().catch(() => null)
        const message = typeof body?.detail === 'string' ? body.detail : 'Couldn’t save the team. Try again.'
        setError(message)
        return
      }
      onCreated(await response.json())
    } catch {
      setError('Couldn’t save the team. Try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form className="panel team-form" onSubmit={submit} onChange={() => { requestId.current = null }}>
      <fieldset disabled={saving}>
        <legend>Add team</legend>
        <label>
          Team name
          <input name="name" required maxLength={80} value={name} onChange={(event) => setName(event.target.value)} />
        </label>
        <label>
          Short description (optional)
          <textarea name="description" maxLength={280} rows={3} value={description} onChange={(event) => setDescription(event.target.value)} />
        </label>
        <label>
          Vehicle photo
          <input name="photo" type="file" accept={photoTypes.join(',')} required onChange={choosePhoto} />
        </label>
        <p className="field-hint">JPEG, PNG, or WebP. Up to 5 MiB.</p>
        <div className="team-form-actions">
          <label>
            Card background
            <input type="color" value={color || defaultColor} onChange={(event) => setColor(event.target.value)} />
          </label>
          <button type="button" onClick={() => { setColor(''); requestId.current = null }} disabled={!color}>Reset color</button>
        </div>
        {photo && preview && (
          <TeamCard team={{
            name: name.trim() || 'Team name',
            description: description.trim(),
            photoUrl: preview,
            photoAlt: 'Selected vehicle photo preview',
            color,
          }} />
        )}
        <div className="team-form-actions">
          <button type="submit">{saving ? 'Saving…' : 'Save team'}</button>
          <button type="button" onClick={onCancel}>Cancel</button>
        </div>
      </fieldset>
      {error && <p role="alert">{error}</p>}
    </form>
  )
}
