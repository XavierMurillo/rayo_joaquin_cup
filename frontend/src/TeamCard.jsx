import React from 'react'

export function cardColors(backgroundColor) {
  if (!/^#[0-9a-f]{6}$/i.test(backgroundColor ?? '')) return undefined

  const [red, green, blue] = backgroundColor.slice(1).match(/../g).map((hex) => {
    const channel = Number.parseInt(hex, 16) / 255
    return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4
  })
  const luminance = 0.2126 * red + 0.7152 * green + 0.0722 * blue
  const blackContrast = (luminance + 0.05) / 0.05
  const whiteContrast = 1.05 / (luminance + 0.05)
  return { backgroundColor, color: blackContrast >= whiteContrast ? '#000' : '#fff' }
}

export function TeamCard({ team, headingId }) {
  return (
    <article className="panel team-card" style={cardColors(team.color)}>
      <div className="team-card-media">
        <img className="team-photo" src={team.photoUrl} alt={team.photoAlt} loading="lazy" />
      </div>
      <div className="team-card-info">
        <h3 id={headingId}>{team.name}</h3>
        {team.description && <p>{team.description}</p>}
      </div>
    </article>
  )
}
