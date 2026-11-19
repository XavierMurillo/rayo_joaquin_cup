## ADDED Requirements

### Requirement: Confirm a winner for a running-order challenge
Evaluation SHALL allow the organizer to select and confirm a team from the current edition roster as the winner of Lead and Follow or Recognize and React.

#### Scenario: Confirm and display a challenge winner (AC-29)
- **WHEN** the organizer confirms a team as the winner of a selected challenge
- **THEN** the confirmed winner appears on that challenge card and in its details dialog
- **AND** the confirmed result remains available after a reload in the current browser
- **AND** an empty roster prevents winner selection

#### Scenario: Correct one challenge result (AC-30)
- **WHEN** the organizer opens Change winner
- **THEN** canceling preserves the last confirmed winner
- **AND** confirming a replacement updates only the selected challenge
- **AND** the running orders and bracket results remain unchanged
