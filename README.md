# School Recommendation System (Similarity Matching)

A **Next.js + TypeScript** web app that recommends **similar US colleges** based on a target “profile” (scores, cost, outcomes, location, etc.). It computes **weighted cosine similarity** on **Z-score standardized** feature vectors using a dataset of **1,128 schools** (`public/data/schools.json`).

## What you can do
- **Enter a target profile** (SAT/ACT, tuition, graduation rate, acceptance rate, etc.)
- **Adjust feature weights** (0–10) to emphasize what matters to you
- **Get top matches** with a similarity “% match” score
- **Filter results** (state, school type, tuition range, SAT range)
- **Compare schools** side-by-side (up to 4)
- **Save favorites** in-browser (localStorage)
- **Use an in-app chatbot** that asks questions and finds matches
- **Toggle light/dark mode**

## Tech stack
- **Frontend**: Next.js / React / TypeScript
- **Backend**: Next.js API routes (`/api/*`)
- **Testing**: Jest + Testing Library

## How similarity is computed (the “model”)
Implemented in `utils/similarity.ts` and used by both the API and the chatbot:

1. **Select numeric features** (12 fields):  
   `avg_sat, avg_act, graduation_rate, acceptance_rate, student_faculty_ratio, tuition_cost, avg_aid, student_population, international_percentage, latitude, longitude, ranking`
2. **Compute mean/std** for each feature across all schools.
3. **Standardize** values using Z-score: $z = (x - \mu) / \sigma$
4. **Apply weights** (optional): multiply each standardized feature by its weight.
5. **Compute cosine similarity** between the student vector and each school vector.
6. **Sort descending** and return top N.

## Project structure (high level)
```
pages/
  index.tsx              # main UI
  api/
    similarity.ts        # POST /api/similarity
    schools.ts           # GET /api/schools
components/
  StudentForm.tsx        # profile input + weights
  TopSchools.tsx         # results cards
  Filters.tsx            # result filtering
  CompareSchools.tsx     # side-by-side comparison modal
  Chatbot.tsx            # guided Q&A (client-side similarity)
  FavoriteButton.tsx     # local favorites
  ThemeToggle.tsx        # light/dark mode
utils/
  similarity.ts          # Z-score + weighted cosine similarity
  api.ts                 # frontend helpers for calling API routes
public/data/
  schools.json           # dataset (1,128 schools)
scripts/
  process_scorecard.py   # build schools.json from College Scorecard CSV
notebooks/
  Modeling.ipynb         # optional experiments (not required to run the app)
```

## Run locally
Prereqs: Node.js 18+ recommended.

```bash
npm install
npm run dev
```

Then open `http://localhost:3000`.

## API
- **GET** `/api/schools` → returns all schools and a count
- **POST** `/api/similarity` → compute top matches

Request body example:

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
  "topN": 5
}
```

## Tests
```bash
npm test
```

## Data pipeline (optional)
`scripts/process_scorecard.py` converts a College Scorecard CSV into the JSON format the app uses:

```bash
python3 scripts/process_scorecard.py path/to/scorecard.csv public/data/schools.json
```

## Notes / limitations
- Recommendations are **similarity-based**, not an admissions prediction model.
- Some fields can be missing in raw data; the pipeline fills defaults for stable UX.
- `notebooks/Modeling.ipynb` is exploratory and not required to run the web app.

