# Rayo Joakin Cup

Local competition website for IMT-322 Embedded Systems II.

## Run locally

Use Python 3.10 or newer and Node.js 18 or newer. Start from the repository root in PowerShell.

### Install dependencies

Run once on a fresh checkout and rerun when dependencies change.

```powershell
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r backend/requirements.txt
Set-Location frontend
npm.cmd ci
```

### Start the servers

Open two PowerShell terminals at the repository root. In the first, start the Python API.

```powershell
.\.venv\Scripts\python.exe -m uvicorn backend.main:app --host 127.0.0.1 --port 8000
```

Start the React frontend in the second terminal.

```powershell
Set-Location frontend
npm.cmd run dev
```

Open [the local edition selector](http://127.0.0.1:5173). Keep both terminals running while using the site.

## Run the tests

From the repository root, run the Python HTTP tests and the React component and API state tests.

```powershell
.\.venv\Scripts\python.exe -m unittest backend.test_editions
Set-Location frontend
npm.cmd test
```

The Python suite starts its own temporary loopback server. The React suite uses controlled fetch responses and rendered component markup. Use the OpenSpec acceptance plan for browser checks such as viewport sizing, keyboard focus, and navigation.

## Build the frontend

From `frontend`, run `npm.cmd run build` to generate `frontend/dist` and `npm.cmd run preview` to serve the build locally on port 4173. Keep the Python API running for the preview.

Vite proxies `/api` to `http://127.0.0.1:8000`. Set the `API_TARGET` environment variable before starting Vite if the backend runs elsewhere. A future host can serve the build, forward `/api` to the Python app, and serve `index.html` for frontend routes such as `/editions/iii`.

## Competition content

Edition data lives in `backend/editions.json`. Restart the API after editing it. Verify changes against the competition guidelines and record changes to website behavior in the active OpenSpec delta.

To publish a team, place the vehicle photo under `frontend/public/team-photos/` and add a record to the relevant edition's `teams` list with `id`, `name`, `description`, `photoUrl` (for example, `/team-photos/team-name.webp`), and `photoAlt` (a short description of the vehicle in the photo).
