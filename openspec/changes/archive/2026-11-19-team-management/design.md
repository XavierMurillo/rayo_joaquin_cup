# Local team management design

## Team pop-up

Show management actions for locally stored teams. Edit opens the existing form inside the pop-up, prefilled with the saved values and a preview of the current photo. Reuse the creation limits and preview behavior. Cancel returns to the saved profile. On success, update the selected profile and its roster tile. If a save fails, keep the edits available for retry.

Delete shows a confirmation naming the team and explaining that its photo will be removed. Cancel returns to the profile. After successful deletion, close the pop-up and move keyboard focus to the next team tile or to Add team if the roster is empty. An unsuccessful deletion keeps the profile visible and reports the error.

## API and storage

Add edition-scoped PATCH and DELETE operations at `/api/editions/{editionId}/teams/{teamId}`. PATCH accepts multipart form data and an optional replacement photo. Reuse existing field and photo validation. Update the existing SQLite row in one transaction and preserve its ID. Return the updated card with a versioned photo URL when the image changes so an existing browser cache cannot show the previous photo.

DELETE removes the team and its photo in one database transaction. A missing team or a team from another edition returns 404. Expose whether a team is locally managed in the edition response so the frontend can determine which entries have management actions.
