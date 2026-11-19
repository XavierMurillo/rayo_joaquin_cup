# Team creation design

## Frontend

Open an inline form from the Teams section. Use a native file picker and show a photo preview. Label the optional description and provide inline validation. Disable the submit control during the request. Keep the selected file and entered text after an error so the organizer can retry. On success, show the returned card and reset the form.

Reuse the existing team-card rendering and edition fetch. Render the description only when the card has one. Use the existing checkered-flag theme, visible focus indicators, and responsive grid.

Add a color picker with a live card preview and a reset to the site default. Apply the chosen background across the entire card, center the team name, and choose black or white text based on the background luminance. Accept only an optional six-digit hex color in the API and persist it alongside the team. Existing entries use the default card background.

Present teams as an original, photo-led roster inspired by the [Super Smash Bros. fighter directory](https://www.smashbros.com/es_ES/fighter/index.html). Use a compact, responsive grid of centered-crop thumbnails with centered team names. Open the full, uncropped photo and optional description in a native modal dialog on the edition page. Support keyboard activation, Escape, a Close button, and focus return to the selected tile. Use the full card in the upload preview and dialog. Apply a small image zoom on tile hover where supported and disable it when reduced motion is requested.

Frame the dialog photo with even padding on all sides so the team color is visible above it as well. Let the photo keep its original proportions within the available width and height. The roster keeps its cropped thumbnails.

When the dialog opens, slide its name and description in from the left with a short fade. Keep the photo stationary and show the text immediately when reduced motion is requested.

## Backend and storage

Use a multipart POST to `/api/editions/{editionId}/teams`. Validate the edition, trimmed fields, and photo server-side. Read no more than the size limit plus one byte from the uploaded file, confirm the actual image format and decodability, and reject unsupported, oversized, or corrupt content before saving.

Use a local SQLite database with a configurable path in an ignored runtime directory. Store the photo bytes and team metadata in the same transaction. Generate IDs on the server and serve photos by edition and team ID using the validated image type. Include saved teams in the existing edition detail response. Preserve and display any existing JSON-backed team entries.

Limit decoded images to 24 million pixels. Reuse a client-generated request ID when retrying an unchanged form, so a lost response can be recovered without adding a duplicate team.

Keep both services bound to loopback for this iteration. A future remotely accessible editor would require its own access-control design.
