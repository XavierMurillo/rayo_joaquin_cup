## ADDED Requirements

### Requirement: Edit a locally managed team
The local site SHALL allow the organizer to update a locally managed team's name, optional description, color, and vehicle photo from its edition pop-up. The organizer SHALL be able to keep the saved photo, replace it, or cancel the edit.

#### Scenario: Update a team and keep its photo (AC-14)
- **WHEN** the organizer opens Edit team, changes a field, and saves without selecting a new photo
- **THEN** the existing values are prefilled and the pop-up and roster show the updated team after saving
- **AND** the original photo and team identity are preserved across reload and API restart

#### Scenario: Replace a team photo or recover from an invalid edit (AC-15)
- **WHEN** the organizer selects a valid replacement photo and saves
- **THEN** the pop-up and roster show the new photo immediately
- **AND** canceling or submitting invalid changes leaves the stored profile intact
- **AND** on a failed save the form explains the error and preserves the entered changes

### Requirement: Delete a locally managed team
The local site SHALL request confirmation before permanently deleting a locally managed team and its stored photo.

#### Scenario: Confirm or cancel team deletion (AC-16)
- **WHEN** the organizer selects Delete team
- **THEN** the confirmation identifies the selected team by name
- **AND** canceling preserves the profile and photo
- **AND** confirming removes the tile and photo after a successful response, including after reload
- **AND** when the last team is removed the empty state returns

### Requirement: Scope team management to the selected edition
The site SHALL offer editing and deletion for locally managed entries in their own edition.

#### Scenario: Restrict team management to local entries (AC-17)
- **WHEN** the site shows a repository-managed team or the API receives a mutation for a missing team or mismatched edition
- **THEN** the repository-managed profile has no management actions
- **AND** the API rejects the missing or mismatched team without modifying stored entries
