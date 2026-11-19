## MODIFIED Requirements

### Requirement: Edition teams
Each available edition SHALL have a Teams section driven by its API data. Each published team SHALL show its name and a vehicle photo with descriptive alternative text, and SHALL show a short description when supplied.

#### Scenario: Browse edition teams (AC-09)
- **WHEN** a student opens an available edition
- **THEN** the Teams section shows only that edition's team entries, each with a centered name and compact vehicle photo thumbnail
- **AND** selecting a tile opens an in-page dialog with the full photo and any supplied description
- **AND** the full photo keeps its proportions within a padded frame that shows the team background color on all sides
- **AND** the dialog text enters from the left when opened and appears immediately if reduced motion is requested
- **AND** the dialog can be closed with its Close button or Escape, returning focus to the selected tile
- **AND** the photo-led roster adapts to the available width and respects the device's reduced-motion setting
- **AND** an edition without entries displays “Team details are not available yet.”

## ADDED Requirements

### Requirement: Create a team from the edition page
The local site SHALL allow the organizer to create a team from an available edition using a team name, a vehicle photo selected from the device, and an optional description. The team and photo SHALL be saved together on the local machine.

#### Scenario: Create a team with a local photo (AC-10)
- **WHEN** the organizer chooses Add team, enters a name, selects a supported local photo, and submits with an empty or populated description
- **THEN** the form shows a preview before saving and the team card appears on success
- **AND** the stored photo loads in the browser after a page reload and API restart
- **AND** the team appears only in its selected edition

#### Scenario: Reject invalid team input (AC-11)
- **WHEN** the organizer submits a missing or invalid name, an overlong description, or a missing, unsupported, corrupt, or oversized photo
- **THEN** the site explains what needs correcting
- **AND** the API creates neither a team nor a photo

#### Scenario: Recover from a failed save (AC-12)
- **WHEN** a valid save request fails before the API stores the team
- **THEN** the form reports the error and retains the name, description, and selected photo
- **AND** the organizer can submit again after the API recovers

#### Scenario: Choose a team background color (AC-13)
- **WHEN** the organizer selects a custom background color
- **THEN** the card preview immediately shows that background across the card and can be reset to the default
- **AND** saving with the custom color preserves it across the whole team card after reload
- **AND** the team name is centered and text remains readable on light and dark backgrounds
- **AND** a team without a saved color uses the default card background
