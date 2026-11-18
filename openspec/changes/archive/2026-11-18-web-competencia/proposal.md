# Competition information website

**Checkpoint 1 status** — Approved to implement the revised local edition selector and Version III page. Versions I and II use unavailable-content messages.

## Why

Students in IMT-322 need one place to check the competition logistics, prepare their vehicles, and understand what will be evaluated.

## Scope

- Open on an edition selector with Version I (1-2025), Version II (2-2025), and Version III (2-2026). The owner confirmed the Version II term.
- Run locally as a responsive React frontend that loads competition content from a Python HTTP API.
- Use an original futuristic racing visual direction inspired by F-Zero.
- Use a black-and-white checkered-flag palette and add a Teams section for available editions.
- Publish an overview of Rayo Joakin Cup III and its confirmed logistics.
- Present the four required modules, the hardware platform, and the general evaluation criteria.
- Identify which operational parameters and rules will be announced on event day.
- Support reading and section navigation on phones and desktops.

Registration, live results, score calculation, telemetry, a content administration interface, and deployment are outside this change.

## Content decisions

- Use English for the first version and the documented module names for A–D. The four event names and their mapping to the modules are pending confirmation.
- Maintain content in the repository with owner approval for changes. The start time is omitted until confirmed.
- Show an unavailable-details message on selectable Versions I and II until historical material is supplied.
