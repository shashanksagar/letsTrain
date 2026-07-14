# letsTrain — Design Spec
**Date:** 2026-07-09  
**Status:** Approved for implementation

---

## Overview

letsTrain is a standalone offline-first Progressive Web App (PWA) for strength and fitness training. It builds personalised workout programs, logs sessions, tracks progress across all dimensions (strength, body composition, nutrition, recovery), and lets users share achievements without requiring an account.

---

## Platform & Tech Stack

| Layer | Choice | Reason |
|---|---|---|
| Framework | React 18 + Vite + TypeScript | Fast builds, PWA plugin, strong typing |
| Styling | TailwindCSS | Dark Teal design system, utility-first |
| Storage | Dexie.js (IndexedDB) | Offline-first, no backend, persistent on device |
| Charts | Recharts | Lightweight, composable, works offline |
| Hosting | Vercel (free tier) | PWA, auto-deploy from git |
| Auth | None | Local-only, anonymous, no account required |

**Design system:** Dark Teal — near-black background (`#0d1117`), teal/cyan gradient accents (`#00d4aa` → `#0080ff`), white body text, subtle dark card surfaces (`#161b22`).

**PWA features:** Installable on Android/iOS home screen, works fully offline, app-shell caching via service worker.

---

## Fitness Profile (Onboarding)

A multi-step wizard shown on first launch. Answers stored in `UserProfile` table. User can edit any field later in Settings.

### Profile Fields

| Field | Options |
|---|---|
| Name | Free text |
| Age | Number |
| Weight | Number + unit (kg/lb) |
| Height | Number + unit (cm/ft) |
| Experience Level | Beginner / Intermediate / Advanced |
| Primary Goal | Build Muscle / Build Strength / Strength-Hypertrophy Hybrid / Recomp/Cut |
| Available Equipment | Full Gym / Home Barbell / Dumbbells Only / Bodyweight (multi-select) |
| Training Days/Week | 3 / 4 / 5 / 6 / Flexible |
| Session Length | 45 min / 60 min / 90 min / Flexible |
| Progressive Overload Mode | Fully Automatic / Semi-automatic / Manual / All (user picks in settings) |

---

## Program Generator

The core algorithmic engine. Runs entirely client-side in TypeScript. Generates a full weekly training program from the user profile.

### Program Templates

| Profile | Program |
|---|---|
| 3 days/week | Full Body (all muscle groups each session) |
| 4 days/week | Upper / Lower split |
| 5 days/week | Push / Pull / Legs + 2 Upper days |
| 6 days/week | Full PPL (Push / Pull / Legs × 2) |
| Flexible | App suggests based on goal, user confirms |

### Muscle Group Coverage

Every weekly program guarantees coverage of: **Chest, Back (lat/rhomboid), Shoulders (front/lateral/rear), Biceps, Triceps, Forearms, Quads, Hamstrings, Glutes, Calves, Core/Abs, Traps**.

### Periodization

- **Beginner:** Linear progression — add weight every session on compound lifts.
- **Intermediate:** Weekly undulating periodization (volume/intensity alternates week to week).
- **Advanced:** Block periodization — accumulation → intensification → deload cycles (4-week blocks).

### Exercise Selection

Exercises filtered by available equipment. Each slot has a primary exercise and 1–2 alternatives the user can swap. Volume and intensity targets set by goal:

| Goal | Rep Range | Sets | Weekly Volume |
|---|---|---|---|
| Hypertrophy | 8–15 | 3–5 | High (16–20 sets/muscle) |
| Strength | 1–6 | 4–6 | Moderate (8–12 sets/muscle) |
| Hybrid | 4–12 | 3–5 | Moderate-high |
| Recomp | 8–15 | 3–4 | Moderate |

---

## Workout Logger

The in-session screen. Designed for one-handed phone use in the gym.

### Features

- Current exercise name, target sets × reps × weight
- Set logging: tap to mark complete, log actual reps/weight per set
- Built-in rest timer (auto-starts after each set, configurable duration)
- Swap exercise button (pulls from alternatives)
- Notes field per exercise
- "Finish workout" saves session to history
- Progressive overload suggestion displayed before each set (based on last session)

### Overload Logic

- **Automatic:** If all sets completed at target reps, suggest +2.5kg next session
- **Semi-automatic:** Shows suggestion, user confirms or overrides before logging
- **Manual:** No suggestion shown, user enters weight freely

---

## Progress Dashboard

Visual progress tracking across all metrics. All data sourced from IndexedDB.

### Charts & Views

- **Strength curves** — weight over time per exercise (line chart)
- **Volume over time** — total weekly sets per muscle group
- **Bodyweight trend** — weight logged over time (line + 7-day moving average)
- **Body measurements** — chest, waist, hips, arms, legs over time
- **Body fat %** — if tracked, trend over time
- **PR board** — all-time personal records per exercise
- **Streak calendar** — heatmap of training days (GitHub-style)
- **Workout frequency** — sessions per week bar chart

---

## Exercise Library

~150 exercises covering all equipment types and muscle groups.

### Exercise Data Model

```
Exercise {
  id, name, muscleGroups: string[], secondaryMuscles: string[],
  equipment: EquipmentType[], movementPattern: string,
  instructions: string[], tips: string[]
}
```

### Filtering

Filter by: muscle group, equipment, movement pattern (push/pull/hinge/squat/carry/isolation). Searchable by name.

---

## Calendar & Habit Tracker

- Monthly calendar view showing scheduled vs completed workouts
- Streak tracking (current and longest streak)
- Rest day scheduling and reminders (push notification via PWA)
- Weekly summary: sessions completed, total volume, average session duration

---

## Body Measurements Tracker

Standalone logging screen separate from workouts.

- Log: date, bodyweight, body fat %, chest, waist, hips, left arm, right arm, left thigh, right thigh
- All fields optional per entry
- Visual trend charts for each measurement

---

## Nutrition & Macro Logger

Daily food log — simple, no barcode scanner in v1.

- Log meals with: name, calories, protein (g), carbs (g), fat (g)
- Daily totals vs targets (targets auto-calculated from profile: weight, goal, activity level)
- Weekly macro average charts
- Custom macro targets in settings

---

## Recovery & Rest Day Suggestions

Rule-based engine (no AI API) that analyses recent training load:

- If 3+ consecutive training days → suggest rest day
- If session RPE average logged > 8 for 2+ days → suggest deload
- If same muscle group trained 2 days in a row → warning
- Rest day suggestions shown on home screen and calendar

RPE (Rate of Perceived Exertion) logged per session (1–10 scale, optional).

---

## Social / Sharing

Export-based, no accounts needed.

- **Share PR** — generates a styled card image (canvas API) showing the lift, weight, date. Share via native share sheet (Web Share API).
- **Share program** — exports weekly program as a PDF or image.
- **Export data** — full data export as JSON (backup/restore).
- **Import data** — restore from a previously exported JSON file.

---

## Data Model (IndexedDB via Dexie.js)

```
Tables:
  userProfile       — single row, all profile fields
  programs          — generated programs (versioned)
  workoutSessions   — completed session records
  setLogs           — individual set records (linked to session)
  bodyMeasurements  — date-stamped measurement entries
  nutritionLogs     — daily food entries
  exerciseLibrary   — seeded at app start, read-only
```

---

## Navigation Structure

```
Home (dashboard snapshot)
├── Today's Workout → Workout Logger
├── My Program → Program view / generator
├── Progress → Dashboard (tabs: Strength / Body / Nutrition / Calendar)
├── Library → Exercise Library
├── Log Body → Body Measurements
├── Log Food → Nutrition Logger
└── Settings → Profile / Overload mode / Units / Export / Import
```

---

## Out of Scope (v1)

- Step count / Google Fit integration
- User accounts / cloud sync
- Social feed / friend system
- AI-generated programs (rule-based only)
- Barcode scanner for food
- Video demonstrations for exercises

---

## Success Criteria

- User can complete full onboarding in under 3 minutes
- Generated program covers all major muscle groups with no gaps
- Workout can be logged entirely one-handed on a phone
- All data persists across app restarts and browser updates
- App installs as PWA on Android and iOS
- App works fully offline after first load
