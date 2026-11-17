## 1. Planning

- [x] 1.1 Record the agreed decisions and content defaults in the proposal, delta, and design.
- [x] 1.2 Record the owner's checkpoint 1 decision before starting implementation.

## 2. Implementation

- [x] 2.1 Add the Python API and separate edition data (AC-01–AC-03, AC-06, AC-07).
- [x] 2.2 Add the React edition selector, edition URLs, and loading and retry states (AC-06–AC-08).
- [x] 2.3 Add Version III overview, logistics, modules, evaluation, and announcements (AC-01–AC-03).
- [x] 2.4 Add responsive racing-inspired styling and keyboard-accessible navigation (AC-04, AC-05).
- [x] 2.5 Document startup and build commands and verify the production frontend builds.
- [x] 2.6 Demonstrate the runnable local app and record the owner's checkpoint 2 decision.
- [x] 2.7 Apply the revised palette, label the module section Challenges, and add Teams (AC-02, AC-04, AC-05, AC-09).

The owner approved the first iteration at checkpoint 2 after reviewing the checkered-flag design. The production frontend build succeeded. Local smoke checks returned HTTP 200 for the selector, the Version III route, and the two corresponding proxied API requests. The API returned three editions and four Version III modules. The browser automation host was unavailable. The acceptance results below remain pending formal execution.

## 3. Verification

| Check | Procedure | Result |
| --- | --- | --- |
| AC-01 | Compare the overview and logistics with the guidelines cover and confirmed owner updates. | Pending |
| AC-02 | Compare all four module sections and the hardware platform with the cover and Part I section 2. | Pending |
| AC-03 | Compare the evaluation and event-day information with Part I sections 1–3 and check that pending details are identified. | Pending |
| AC-04 | Open the selector and Version III at 360 and 1280 CSS pixels, check for horizontal overflow, and use the navigation. | Pending |
| AC-05 | Tab through each interactive element, check visible focus, and activate it with Enter. | Pending |
| AC-06 | Confirm all three labels, select each edition, reload its direct URL, and check Back navigation from the selector flow. Verify the historical unavailable state. | Pending |
| AC-07 | Observe requests to the local Python API, compare the UI to the returned data, and throttle a request to check the loading state. Check HTTP 404 for an unknown edition ID. | Pending |
| AC-08 | Fail a list request and a detail request, then restore the API and verify retry works in each view. | Pending |
| AC-09 | Verify the empty state, then check an edition with a representative team entry for its name, vehicle photo, alternative text, and description. | Pending |

- [ ] 3.1 Run the checks and record outcomes and observed defects.
- [ ] 3.2 Review results and defects with the owner at checkpoint 3.
- [ ] 3.3 Fix agreed defects, repeat affected checks, and record the final outcomes.
- [ ] 3.4 Archive the verified change and apply its delta to the accepted specs.
