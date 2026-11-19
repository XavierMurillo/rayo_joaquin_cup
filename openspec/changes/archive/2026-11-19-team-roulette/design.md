# Team roulette design

Share the edition's current team list with the Teams and Evaluation sections so a new draw includes changes made on the page. Use a labeled selector for Challenges 1 and 2. Capture team IDs and names on the first spin of each challenge. Store the captured roster, remaining pool, and ordered results in browser storage keyed by edition and challenge. Returning to a challenge restores its own draw, and reset clears only the selected challenge.

Choose uniformly from the remaining teams using browser randomness and rejection sampling. Commit the result to the draw state before animating the wheel. The animation reveals the selected result and never influences it. Disable overlapping spins, and reveal the result immediately when reduced motion is enabled. Announce each result in text and show the numbered draw order.

With no teams, show an empty state. With one remaining team, the next spin selects it. Once every team has been drawn, mark the order complete and offer a confirmed reset.

Give Evaluation a deep burgundy background and a gold accent so the criteria, announcements, and roulette read as one section.

Use a deep teal backdrop for Teams, with a lighter teal accent on the heading and Add team control. Team cards keep their own colors.

Capture the profile color with the roster snapshot and use the fallback wheel palette for teams without a valid custom color. Store completed orders separately from draws in the same browser, keyed by edition and challenge. Save and overwrite explicitly, update the related challenge card and details dialog immediately, and preserve the last saved order when resetting a draw. Highlight saved orders with gold text in both views.
