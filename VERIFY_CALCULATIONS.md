# Verification of Similarity Calculations

## Cosine Similarity Formula

The cosine similarity between two vectors **A** and **B** is:

```
cos(θ) = (A · B) / (||A|| × ||B||)
```

Where:
- **A · B** = dot product = Σ(A_i × B_i)
- **||A||** = Euclidean norm = √(Σ(A_i²))
- **||B||** = Euclidean norm = √(Σ(B_i²))

## Implementation Verification

### 1. Cosine Similarity Function (lines 44-65)

```javascript
function cosineSimilarity(vecA, vecB) {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];        // A · B
    normA += vecA[i] * vecA[i];              // ||A||²
    normB += vecB[i] * vecB[i];              // ||B||²
  }
  
  normA = Math.sqrt(normA);                  // ||A||
  normB = Math.sqrt(normB);                  // ||B||
  
  if (normA === 0 || normB === 0) return 0;
  
  return dotProduct / (normA * normB);      // (A · B) / (||A|| × ||B||)
}
```

✅ **This correctly implements the cosine similarity formula**

### 2. Standardization (Z-score normalization)

The StandardScaler in sklearn uses:
```
z = (x - μ) / σ
```
where:
- μ = mean of the feature across all samples
- σ = standard deviation (population: divide by n, not n-1)

**Implementation (lines 22-31):**
```javascript
function computeStats(schools, featureKey) {
  const values = schools.map(school => school[featureKey]).filter(v => v != null && !isNaN(v));
  
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
  const std = Math.sqrt(variance);
  
  return { mean, std: std === 0 ? 1 : std };
}
```

✅ **This correctly computes mean and standard deviation (population std)**

**Scaling (lines 36-39):**
```javascript
function scaleValue(value, stats) {
  if (value == null || isNaN(value)) return 0;
  return (value - stats.mean) / stats.std;  // (x - μ) / σ
}
```

✅ **This correctly applies Z-score normalization**

### 3. Feature Matching with Python Code

**Python (from your notebook):**
```python
feature_cols = ['avg_sat','avg_act','graduation_rate','acceptance_rate',
                'student_faculty_ratio','tuition_cost','avg_aid','student_population',
                'international_percentage','latitude','longitude','ranking']

scaler = StandardScaler()
scaled_features = scaler.fit_transform(df[feature_cols])
```

**JavaScript (lines 86-99):**
```javascript
const featureKeys = [
  'avg_sat',
  'avg_act',
  'graduation_rate',
  'acceptance_rate',
  'student_faculty_ratio',
  'tuition_cost',
  'avg_aid',
  'student_population',
  'international_percentage',
  'latitude',
  'longitude',
  'ranking'
];
```

✅ **Same features in same order**

### 4. Similarity Computation Flow

**The algorithm:**
1. Compute mean and std for each feature from ALL schools (like `scaler.fit()`)
2. Scale student profile using those stats (like `scaler.transform()`)
3. Scale each school using those same stats (already done in Python, but we re-scale)
4. Compute cosine similarity between scaled student vector and scaled school vector
5. Sort by similarity score (descending)

✅ **This matches the approach used in your Python notebook**

## Test Case Example

If a student profile exactly matches School_1:
- Both vectors will be scaled identically (same mean/std)
- After scaling, they become the same vector
- Cosine similarity of a vector with itself = 1.0
- School_1 should be ranked #1 with score = 1.0

## Conclusion

The implementation **correctly calculates**:
- ✅ Z-score normalization (StandardScaler equivalent)
- ✅ Cosine similarity formula
- ✅ Feature extraction and matching
- ✅ Sorting by similarity score

The code performs **real mathematical calculations**, not placeholder values.


