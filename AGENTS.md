# Project working agreement

- Write project artifacts and collaboration updates in English. Preserve official names and quotations as written in the competition guidelines. Decide the public website language in the specification.
- Organize work into focused OpenSpec changes with a meaningful outcome. Keep code and content changes modular, reuse existing components where appropriate, and avoid unrelated refactors or formatting churn.
- Treat each feature as a ticket on its own branch. After validation and all required testing are complete, merge the branch into main and verify the merge. Merging is required to finish the ticket.
- Work within the approved proposal, specs, and design. If new work changes the agreed scope, explain the impact and consult the project owner before doing it.
- Use the official competition guidelines as the source of truth for competition facts and rules. Flag ambiguities for the project owner and record their resolutions before treating them as confirmed.
- Use `openspec/specs/` as the source of truth for accepted website behavior. Record proposed additions, modifications, and removals as deltas under `openspec/changes/<change>/specs/`. Update the active delta and its acceptance scenarios before implementing a revised requirement.
- Link each requirement to observable acceptance scenarios, implementation tasks, and verification results. Record failures and cases that could not be run.
- Pause for review at the three agreed checkpoints. Record the outcome in the active change.
  1. After the development plan, review scope, specs, design, tasks, and planned checks before implementation.
  2. After implementation, review the runnable version and requirement coverage before formal testing.
  3. During testing, review the first test results and defects. Retest affected scenarios after fixes and archive the verified change to merge its deltas into the accepted specs.
