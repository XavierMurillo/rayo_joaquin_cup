## ADDED Requirements

### Requirement: Open challenge details
Version III SHALL provide a detail view for each challenge in the Challenges section on the same page.

#### Scenario: Open the selected challenge (AC-18)
- **WHEN** a student activates a challenge's details action with the keyboard or pointer
- **THEN** the selected challenge opens in a dialog without navigating to another page
- **AND** the student can scroll through the instructions and close the dialog, returning focus to its trigger
- **AND** the dialog uses the available space for side-by-side instructions and illustration on wide screens and stacks them on narrow screens

### Requirement: Show approved competition instructions
The site SHALL show the organizer-confirmed event-day instructions for each challenge. The site SHALL identify details awaiting release and provide descriptive alternative text for a reference visual when supplied.

#### Scenario: Read confirmed and pending challenge details (AC-19)
- **WHEN** a student opens a challenge
- **THEN** the view shows the confirmed objective, setup, procedure, allowed adjustments, and evaluation instructions where available
- **AND** any unreleased details are identified as pending
- **AND** an approved image or diagram is presented with alternative text and a caption when available
- **AND** when a visual includes example rules, its caption identifies them as provisional

#### Scenario: Read the separate-arena win condition (AC-20)
- **WHEN** a student opens Clear the Arena
- **THEN** the instructions state that each team uses a separate arena and the first team to clear all its targets wins
