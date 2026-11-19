## 1. Planning

- [x] 1.1 Review the scope, confirmation behavior, persistence design, and tests at Checkpoint 1.

## 2. Implementation

- [x] 2.1 Implement edition-scoped updates and deletion with validation and atomic storage (AC-14–AC-17).
- [x] 2.2 Reuse the team form for editing and update the roster and profile after saving (AC-14, AC-15).
- [x] 2.3 Add deletion confirmation, feedback, and focus return (AC-16, AC-17).
- [x] 2.4 Demonstrate the runnable feature at Checkpoint 2. The owner reviewed the local interface and approved proceeding to testing.

The frontend build and all 14 existing regression cases passed. Disposable-database smoke checks exercised edit, photo replacement, and deletion. The local preview serves the new endpoints. Formal acceptance checks remain pending.

## 3. Verification

| Check | Procedure | Result |
| --- | --- | --- |
| AC-14 | Check prefilled values, save field changes with the original photo, then reload and restart the API. | Passed. Component and HTTP checks confirmed prefilled values, saved changes, and unchanged photo and team ID. The owner confirmed persistence after reload and API restart in Opera. |
| AC-15 | Replace a photo and check that both views show it immediately. Try canceling, invalid input, and a failed save. Compare stored data and retained form values. | Passed. Component checks covered cancellation. HTTP checks verified replacement photo bytes, the updated URL, and rejection of an invalid photo. The owner confirmed form retention and successful retry after the API outage in Opera. |
| AC-16 | Cancel deletion and verify data remains. Confirm deletion and verify the tile and photo disappear, focus returns to the roster controls, and reload preserves removal. | Passed. Component and HTTP checks verified confirmation, cancellation, and removal of the roster entry and photo. The owner confirmed focus return and removal after reload in Opera. |
| AC-17 | Verify repository-managed entries have no controls. Attempt mutations for missing and wrong-edition entries over HTTP. | Passed. The component hides management actions for a repository-managed entry. The API rejected missing and wrong-edition mutations without altering the existing team. |

- [x] 3.1 Review results at Checkpoint 3. Ten Python tests, eight React tests, and the production build passed. The owner confirmed the remaining Opera checks.
- [x] 3.2 Archive the verified change, merge the ticket into main, and verify the remote merge.
