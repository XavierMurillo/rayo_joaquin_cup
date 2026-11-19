# Competition information

## Requirements

### Requirement: Competition edition selection
The homepage SHALL allow students to select Versions I, II, and III and display each edition's term label. Each edition SHALL have a direct URL and an explicit message when historical details are unavailable.

#### Scenario: Select and revisit an edition (AC-06)
- **WHEN** a student opens the homepage
- **THEN** the selector shows Version I (1-2025), Version II (2-2025), and Version III (2-2026)
- **AND** selecting an edition opens its own URL with its details or an unavailable-details message
- **AND** reloading that URL preserves the selection and browser Back returns to the selector

### Requirement: Local competition data
The React frontend SHALL obtain the edition list and edition details from the local Python HTTP API. The app SHALL provide loading, unavailable-content, and recoverable error states.

#### Scenario: Load edition content from the API (AC-07)
- **WHEN** the API returns the edition list and a selected edition
- **THEN** the interface displays the data returned by the API
- **AND** a delayed response shows a loading state

#### Scenario: Recover from a failed API request (AC-08)
- **WHEN** the edition list or detail request fails
- **THEN** the interface displays an error and allows the request to be retried
- **AND** a successful retry displays the requested data

### Requirement: Competition overview and logistics
The site SHALL identify Rayo Joakin Cup III as the IMT-322 Embedded Systems II competition, explain its emphasis on modularity, adaptability, and architectural robustness, and display the confirmed date and room.

#### Scenario: Find confirmed logistics (AC-01)
- **WHEN** a student opens Version III
- **THEN** they can find Thursday, November 19, 2026, and room C202
- **AND** any displayed start time has been confirmed by the owner

### Requirement: Vehicle preparation
The site SHALL describe the Raspberry Pi 5 with a Tiva C or Raspberry Pi Pico W and present all four required, integrated modules with their documented operational goals.

#### Scenario: Review the four modules (AC-02)
- **WHEN** a student reads the Challenges section
- **THEN** they can find A, Real-Time Visual Tracking & Closed-Loop Control, including the 25–45 cm following distance
- **AND** they can find B, Visual State Machine & Timed Actuation (Timed FSM), including recognition of a visual sequence and timed execution of the resulting actions
- **AND** they can find C, Reactive Arena Navigation & Perimeter Boundary Safety, including target acquisition and priority boundary recovery
- **AND** they can find D, Real-Time Wireless Teleoperation, including low-latency throttle and steering over Bluetooth or Wi-Fi

### Requirement: Edition teams
Each available edition SHALL have a Teams section driven by its API data. Each published team SHALL show its name, a vehicle photo with descriptive alternative text, and a short description.

#### Scenario: Browse edition teams (AC-09)
- **WHEN** a student opens an available edition
- **THEN** the Teams section shows only that edition's team entries
- **AND** an edition without entries displays “Team details are not available yet.”

### Requirement: Evaluation and event-day announcements
The site SHALL show the published evaluation criteria and explain that teams must support dynamic configuration by software parameters or serial commands. It SHALL identify the event-day announcements without presenting unconfirmed rules or scoring as official.

#### Scenario: Check evaluation criteria and pending details (AC-03)
- **WHEN** a student reads the evaluation section
- **THEN** they can find modularity, autonomy, robustness, smoothness, and ease of operation
- **AND** they can identify target colors, sequence lengths, arena dimensions, and specific operational rules as event-day announcements
- **AND** the wireless mystery challenge rules and any unpublished scoring details have no invented values

### Requirement: Readable and keyboard-accessible navigation
The site SHALL provide readable content and usable section navigation on mobile and desktop. Interactive elements SHALL be keyboard accessible and show visible focus.

#### Scenario: Read on mobile and desktop (AC-04)
- **WHEN** a student opens the selector and Version III at viewport widths of 360 and 1280 CSS pixels
- **THEN** they can read the content and use the selector and navigation without horizontal page scrolling

#### Scenario: Navigate by keyboard (AC-05)
- **WHEN** a student uses Tab and Enter
- **THEN** interactive elements receive visible focus and their actions work from the keyboard

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

### Requirement: Generate a random challenge bracket
The Evaluation section SHALL allow the organizer to generate independent brackets for Challenges 3 and 4 from the Version III roster.

#### Scenario: Seed the current roster (AC-25)
- **WHEN** the organizer generates a bracket with at least two teams
- **THEN** the site randomly seeds each team exactly once in that challenge's bracket
- **AND** byes advance eligible teams without counting as played matches or losses
- **AND** the round-by-round diagram shows the seeded teams, byes, and future match slots separately from winner entry
- **AND** the site explains when there are too few teams to generate a bracket

### Requirement: Advance matches by the challenge format
The organizer SHALL be able to confirm the winner of a match that has two known teams. The bracket SHALL advance teams and announce its champion according to the selected format.

#### Scenario: Advance the single-elimination bracket (AC-26)
- **WHEN** a confirmed match result is entered in Challenge 3
- **THEN** its winner advances and its loser is eliminated
- **AND** if multiple matches are ready, the organizer can select and record any ready match first
- **AND** the selected match is visibly identified in the bracket diagram and results area
- **AND** the final winner is shown as champion at the end of the diagram

#### Scenario: Advance the double-elimination bracket (AC-27)
- **WHEN** a confirmed match result is entered in Challenge 4
- **THEN** a first loss moves a team to the lower bracket and a second loss eliminates it
- **AND** a lower-bracket win in the grand final leads to a reset final
- **AND** the site shows the champion at the end of the diagram once the opposing finalist has two losses

### Requirement: View and retain challenge brackets
The site SHALL retain the two brackets independently in the current browser. The corresponding challenge card and dialog SHALL provide access to its bracket.

#### Scenario: Resume or reset one bracket (AC-28)
- **WHEN** the organizer reloads, switches challenges, or changes the team roster
- **THEN** the generated bracket and recorded outcomes remain available for the matching challenge
- **AND** a completed tournament shows its champion on the corresponding challenge card and in its details dialog
- **AND** confirming reset clears only the selected bracket
- **AND** the next generation uses the current roster
