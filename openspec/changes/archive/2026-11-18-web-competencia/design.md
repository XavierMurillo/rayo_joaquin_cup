## Proposed implementation

Use React with Vite for the frontend and propose FastAPI for the Python backend. Run both locally, with Vite forwarding same-origin `/api` requests to Python during development. Keep the frontend, API, and edition content in separate modules. Avoid a database for this iteration. Store the edition content in a UTF-8 JSON file owned by the backend and reviewed in the repository.

Use `GET /api/editions` for the ordered list of edition IDs, display labels, and term labels. Use `GET /api/editions/{id}` for edition details and a content-availability status. A known edition without historical content returns an explicit unavailable status in a successful response. An unknown ID returns HTTP 404. A fetch or server failure displays a recoverable error with a retry action.

Use stable paths such as `/` and `/editions/iii` so an edition can be opened directly and browser back navigation works. Keep API requests relative to the origin and runtime settings outside the code where they vary by environment. For a future deployment, a host can serve the frontend build and route `/api` to Python on the same origin, with frontend routing fallback for edition URLs.

Use bold typography, angled panels, and high-contrast accents to evoke futuristic racing while keeping the artwork and interface original. Use semantic HTML, responsive CSS, and visible keyboard focus. Keep visual effects secondary to readability.

Use [Rayo Joakin Cup III Guidelines](../../../../Rayo_Joakin_Cup_III_Guidelines.docx) as the content reference. The cover supplies the course, logistics, and platform. Part I sections 1–3 supply the competition philosophy, module descriptions, and criteria. For any ambiguity, record the owner's clarification in this change and revise the delta before implementation.

The homepage starts with the edition selector. Available editions show logistics and an overview, then Challenges, Teams, and Evaluation. Challenges uses the official module names and technical content. Use near-black surfaces, white text and focus outlines, and a checkered-flag pattern confined to the banner edge.

Store team entries with the edition data. Each entry has an ID, name, description, photo URL, and descriptive alternative text. Version III starts with an empty list until team details are supplied.

For the two-day schedule, target the local API, selector, and edition routing first. Add Version III content and responsive styling next, leaving time for the implementation walkthrough, formal checks, and fixes. Record local startup commands and the frontend build command in the project README during implementation.

## Review checkpoints

1. Review and approve the proposal, delta, design, and planned checks.
2. Review the runnable page and coverage against the delta before formal testing.
3. Review the first test results and defects. After corrections and retests, archive the verified change and merge the delta into the accepted specs.
