# Create teams from the edition page

**Checkpoint 1 status** — Approved, including optional team color. At Checkpoint 2 the owner requested centering the team name and applying the color to the whole card. Vehicle numbers and build highlights are deferred.

## Why

The organizer needs to add a team and its vehicle photo directly from the site. The first iteration requires editing project files.

## Scope

- Add an **Add team** action in the Teams section of each available edition.
- Collect a required team name and vehicle photo from the device, and an optional short description.
- Let each team choose an optional background color for its card when it is created.
- Save the team and photo locally on the machine running the Python API. Show the new card after saving and retain it across app restarts.
- Keep team records scoped to their selected edition.

Editing, deleting, cloud storage, remote image URLs, and multi-user access are outside this ticket. The proposed first release uses the existing loopback-only setup for the organizer.

## Proposed defaults

- Accept JPEG, PNG, and WebP up to 5 MiB.
- Limit the trimmed team name to 80 characters and the optional description to 280 characters.
- Generate the image alternative text from the team name so the form requires only the requested inputs.
