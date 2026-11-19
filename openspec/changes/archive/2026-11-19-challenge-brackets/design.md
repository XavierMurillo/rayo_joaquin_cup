# Challenge bracket design

## Seeding and progression

Shuffle the current edition roster uniformly with Fisher–Yates and the same random index generator as the roulette. Build a draw from that snapshot. If the team count is not a power of two, distribute first-round byes so each bye advances exactly one team and every team has an equal chance of receiving one. Two teams are required to generate a bracket.

For Challenge 3, winners advance and one loss eliminates a team. For Challenge 4, a first loss sends a team to the lower bracket, and a second loss eliminates it. The upper and lower bracket winners meet in the grand final. If the lower bracket winner wins that match, play a reset final because both finalists then have one loss.

## Organizer interface

Place bracket controls in Evaluation with the same challenge selection, section colors, and clear status feedback used for roulette. Show a read-only bracket diagram with labeled rounds, matches, and advancement paths. Offer a match picker when multiple matches are playable, so their results can be recorded in either order. Enable winner selection only after both teams are known. A bye advances automatically. Show the champion in a terminal column after the deciding final.

Keep bracket generation and match progression separate from React rendering. Save the seeded roster and results per edition and challenge in browser storage. After reload, reconstruct the bracket from that state. The challenge card links to its bracket, and the detail dialog shows a read-only bracket. Use confirmed reset to discard one bracket and regenerate from the current roster. On small screens, keep round labels and matches readable with a scrollable bracket view.

Show a gold champion summary on the corresponding challenge card and beside the dialog title when the deciding match is complete. Derive the summary from the same bracket results as the terminal champion column.

Outline the selected playable match and its result form in red. Move the outline when the organizer selects another match, and use a visible text label as an additional indicator.
