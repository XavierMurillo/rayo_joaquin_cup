## ADDED Requirements

### Requirement: Draw an edition running order
The Evaluation section SHALL provide independent random running orders for Lead and Follow and Recognize and React. Each undrawn team SHALL have an equal chance on each spin and SHALL appear at most once in each challenge's order.

#### Scenario: Draw to completion (AC-21)
- **WHEN** the organizer selects Challenge 1 or Challenge 2 and spins the roulette
- **THEN** one team from the undrawn pool is selected and appended to the visible running order
- **AND** further spins exclude selected teams until the order is complete
- **AND** the interface handles an empty roster, a single remaining team, and overlapping spin attempts
- **AND** each wheel segment uses the team's selected profile color when available

#### Scenario: Resume or reset a draw (AC-22)
- **WHEN** the organizer switches challenges, reloads during a draw, or changes the roster
- **THEN** each challenge retains its own saved order and captured roster within the edition
- **AND** confirming a reset clears only the selected challenge's order and lets that challenge start from the current roster

#### Scenario: Read the spin result accessibly (AC-23)
- **WHEN** the organizer actuates the roulette with the keyboard or requests reduced motion
- **THEN** the selected team is announced in text and appears in the numbered order
- **AND** reduced motion reveals the result without a wheel animation

#### Scenario: Save and replace a completed running order (AC-24)
- **WHEN** the organizer saves a completed draw
- **THEN** the corresponding challenge card and its details dialog display the numbered order after saving and after reload in the same browser
- **AND** resetting the draw preserves the last saved order
- **AND** saving a new completed order replaces only that challenge's saved order
