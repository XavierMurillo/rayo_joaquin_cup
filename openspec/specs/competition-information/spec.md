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
