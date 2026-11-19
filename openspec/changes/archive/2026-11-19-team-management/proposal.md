# Edit and delete local teams

**Checkpoint 1 status** — Approved by the owner.

## Why

The organizer needs to correct team details or remove entries created by mistake without editing the database directly.

## Scope

- Put **Edit team** and **Delete team** in the existing team pop-up for teams created through the local site.
- Reuse the team form to update the name, optional description, card color, and vehicle photo. The organizer can keep the current photo or select a replacement.
- Ask for confirmation by team name before deleting a team and its stored photo.
- Apply changes immediately to the roster and persist them locally across restarts.

Keep the existing loopback-only organizer workflow. JSON-backed entries continue to be maintained in the repository. This ticket builds on the merged team creation implementation. Its outstanding browser checks remain tracked in that ticket.
