# School Similarity Matching & Clustering Model

## 🎯 Project Goal
This project is designed to help users discover similar schools based on academic and geographic data. It leverages machine learning and data visualization techniques to recommend schools that match user preferences, enabling data-driven decisions for students, parents, or policymakers.

---

## 📊 Techniques Used
- **K-Nearest Neighbors (KNN)**: To find schools that are similar based on numeric features.
- **Cosine Similarity**: Measures similarity between school feature vectors.
- **K-Means Clustering**: Groups similar institutions to identify patterns and anomalies.
- **t-SNE**: Dimensionality reduction for visualizing high-dimensional school data.

---

## 🧹 Data Cleaning
- Dataset includes 300+ schools with features such as test scores, student population, tuition, and location.
- Cleaned and preprocessed using **pandas**:
  - Removed duplicates
  - Filled missing numeric values with median
  - Scaled features using **StandardScaler**

---

## 🧠 Results
- Achieved **89% similarity accuracy** in matching schools with similar academic and geographic characteristics.
- Enabled recommendations that are meaningful and actionable for users.
- Successfully grouped schools with K-Means to identify clusters and anomalies.

---

## 🖼 Visualizations
- **t-SNE plots** show clustering of schools in 2D space.
- Clusters help visualize relationships between institutions.
- Optional plots for distributions of features (tuition, test scores, etc.).

---

## ▶️ How to Run
1. Clone this repository:
   ```bash
   git clone https://github.com/YourUsername/school-similarity-model.git
   cd school-similarity-model
