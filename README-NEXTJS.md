# School Recommendation System - Next.js Frontend

An interactive school recommendation frontend built with Next.js that helps students find schools similar to their profile using cosine similarity.

## Features

- **Interactive Profile Input**: Enter your SAT/ACT scores, graduation preferences, financial information, and more
- **Feature Weighting**: Adjust the importance of different features to customize recommendations
- **Similarity Computation**: Uses cosine similarity with standardized features (Z-score normalization)
- **Top 5 Recommendations**: Displays the 5 most similar schools with detailed information
- **Responsive Design**: Works on desktop and mobile devices
- **Client-Side Processing**: All computations happen in the browser (no backend required)

## Getting Started

### Prerequisites

- Node.js 14+ and npm/yarn

### Installation

1. Install dependencies:
```bash
npm install
# or
yarn install
```

2. The school dataset has already been converted to JSON format and placed in `public/data/schools.json`

3. Run the development server:
```bash
npm run dev
# or
yarn dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
school-similarity-model/
├── pages/
│   └── index.js              # Main page with state management
├── components/
│   ├── StudentForm.js        # Student profile input form
│   └── TopSchools.js         # Results display component
├── utils/
│   └── similarity.js         # Similarity computation functions
├── styles/
│   ├── Home.module.css       # Main page styles
│   ├── StudentForm.module.css # Form styles
│   └── TopSchools.module.css  # Results card styles
├── public/
│   └── data/
│       └── schools.json      # School dataset (300 schools)
├── package.json
└── next.config.js
```

## How It Works

1. **Feature Extraction**: The system extracts 12 numeric features from the student profile:
   - SAT score
   - ACT score
   - Graduation rate
   - Acceptance rate
   - Student-faculty ratio
   - Tuition cost
   - Average financial aid
   - Student population
   - International student percentage
   - Latitude (optional)
   - Longitude (optional)
   - Ranking

2. **Feature Scaling**: All features are standardized using Z-score normalization (mean=0, std=1) based on the statistics of all schools in the dataset.

3. **Weighted Similarity**: Optionally, users can assign weights to different features to emphasize what matters most to them.

4. **Cosine Similarity**: For each school, the cosine similarity is computed between the student's scaled feature vector and the school's scaled feature vector.

5. **Top 5 Results**: Schools are ranked by similarity score and the top 5 are displayed.

## Usage

1. Fill in your profile information in the form
2. (Optional) Click "Feature Weights" to adjust the importance of different features
3. Click "Find Similar Schools"
4. View your top 5 recommended schools with detailed information

## Building for Production

```bash
npm run build
npm start
```

## Notes

- All computations are performed client-side using pure JavaScript
- The dataset contains 300 schools with various characteristics
- Optional fields (latitude/longitude) can be left empty
- Feature weights default to 1.0 (equal importance) but can be adjusted from 0 to 10
