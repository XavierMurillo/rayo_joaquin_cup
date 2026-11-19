## ADDED Requirements

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
