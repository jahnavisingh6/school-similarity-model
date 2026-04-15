# School Recommendation System (Similarity Matching)

A Next.js + TypeScript web app for finding similar US colleges from a target student or school profile. The app uses weighted cosine similarity on Z-score standardized features and returns ranked matches from a dataset of 1,128 schools in `public/data/schools.json`.

Live app: https://school-similarity-model.vercel.app

## Overview

This project helps users explore colleges by similarity instead of by a single cutoff or admissions prediction. A user can enter a target profile, tune feature importance, and get the closest matching schools based on academic, financial, and institutional attributes.

The current web app includes:

- Student profile entry for SAT, ACT, tuition, aid, graduation rate, ranking, and other core metrics
- Adjustable feature weights from 0 to 10
- Goal school selection for up to 5 schools
- Goal match scoring that shows how close the input profile is to each selected school
- Ranked top-match results
- Client-side filtering by state, school type, tuition, and SAT range
- Side-by-side comparison for up to 4 schools
- Favorites saved in browser local storage
- A guided chatbot that can help users find matching schools

## How The Model Works

The similarity logic lives in `utils/similarity.ts`.

The model uses these 12 numeric features:

- `avg_sat`
- `avg_act`
- `graduation_rate`
- `acceptance_rate`
- `student_faculty_ratio`
- `tuition_cost`
- `avg_aid`
- `student_population`
- `international_percentage`
- `latitude`
- `longitude`
- `ranking`

Computation flow:

1. Compute feature-level mean and standard deviation across all schools.
2. Convert each school feature and each input profile feature into Z-scores.
3. Apply optional user-selected weights to each standardized feature.
4. Compute cosine similarity between the input vector and every school vector.
5. Sort results in descending order and return the top matches.

This is a similarity and discovery tool, not an admissions probability model.

## Current Product Flow

The main page is implemented in `pages/index.tsx`.

Typical user flow:

1. Enter a target profile in the student form.
2. Adjust feature weights if some attributes matter more.
3. Optionally choose up to 5 goal schools.
4. Submit the form to run similarity scoring.
5. Review top matches and goal-school fit scores.
6. Filter, compare, and save schools.

The goal-school workflow is supported by the API in `pages/api/similarity.ts`, which accepts `goalSchoolIds` and returns `goalMatches` ranked on the same scoring scale as the main result list.

## Tech Stack

- Next.js 14
- React 18
- TypeScript
- Jest + Testing Library
- Vercel-ready deployment config in `vercel.json`

## Project Structure

```text
pages/
  index.tsx              Main UI
  api/
    schools.ts           GET /api/schools
    similarity.ts        POST /api/similarity
components/
  StudentForm.tsx        Profile input + weights + goal schools
  GoalMatches.tsx        Goal school scores and ranks
  TopSchools.tsx         Ranked result cards
  Filters.tsx            Result filtering controls
  CompareSchools.tsx     Side-by-side comparison modal
  Chatbot.tsx            Guided school finder
  FavoriteButton.tsx     Local favorites toggle
utils/
  similarity.ts          Similarity engine
  api.ts                 Frontend API helpers
  validation.ts          Request and form validation
public/data/
  schools.json           Processed school dataset
scripts/
  process_scorecard.py   CSV-to-JSON data pipeline
notebooks/
  Modeling.ipynb         Exploratory analysis
```

## Getting Started

Prerequisite: Node.js 18 or newer.

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

Useful scripts from `package.json`:

```bash
npm run dev
npm run build
npm run start
npm test
npm run test:coverage
```

## API

### `GET /api/schools`

Returns the full school dataset and total count.

Example response:

```json
{
  "schools": [],
  "count": 1128
}
```

### `POST /api/similarity`

Computes similarity results for a profile and optionally scores selected goal schools.

Example request:

```json
{
  "profile": {
    "avg_sat": 1200,
    "avg_act": 25,
    "graduation_rate": 75,
    "acceptance_rate": 50,
    "student_faculty_ratio": 15,
    "tuition_cost": 30000,
    "avg_aid": 10000,
    "student_population": 15000,
    "international_percentage": 8,
    "latitude": null,
    "longitude": null,
    "ranking": 150
  },
  "weights": {
    "avg_sat": 1,
    "avg_act": 1,
    "graduation_rate": 1,
    "acceptance_rate": 1,
    "student_faculty_ratio": 1,
    "tuition_cost": 1,
    "avg_aid": 1,
    "student_population": 1,
    "international_percentage": 1,
    "latitude": 1,
    "longitude": 1,
    "ranking": 1
  },
  "topN": 5,
  "goalSchoolIds": [110635, 166683, 215293]
}
```

Example response:

```json
{
  "results": [
    {
      "school": {
        "school_id": 123,
        "school_name": "Example University"
      },
      "score": 0.91
    }
  ],
  "goalMatches": [
    {
      "school": {
        "school_id": 110635,
        "school_name": "Goal School Example"
      },
      "score": 0.87,
      "rank": 14
    }
  ],
  "computedAt": "2026-04-14T00:00:00.000Z",
  "count": 5
}
```

Request rules enforced by the API:

- `profile` is required
- `topN` must be between `1` and `20`
- `goalSchoolIds` is optional
- `goalSchoolIds` must be an array of integers
- At most 5 goal schools can be selected

## Testing

This repo includes component tests and utility tests.

```bash
npm test
```

Current local verification status:

- `npm test` passes
- `npm run build` passes

## Data Pipeline

The script `scripts/process_scorecard.py` converts a College Scorecard CSV into the JSON format used by the app.

```bash
python3 scripts/process_scorecard.py path/to/scorecard.csv public/data/schools.json
```

## Notes And Limitations

- This is a matching tool, not an admissions prediction or ranking engine.
- Data quality depends on the source dataset and preprocessing choices.
- Missing values are normalized to keep the UX stable, which can reduce precision for some schools.
- Geographic similarity uses latitude and longitude when available.
- The exploratory notebook is not required to run the app.
