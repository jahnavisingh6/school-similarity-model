import { useState, useCallback, useEffect, useMemo } from 'react';
import Head from 'next/head';
import StudentForm from '../components/StudentForm';
import TopSchools from '../components/TopSchools';
import Chatbot from '../components/Chatbot';
import Filters, { FilterState, DEFAULT_FILTERS, applyFilters } from '../components/Filters';
import CompareSchools from '../components/CompareSchools';
import ThemeToggle from '../components/ThemeToggle';
import { computeSimilarity, ApiRequestError } from '../utils/api';
import { getDefaultFeatureWeights } from '../utils/validation';
import type { StudentProfile, FeatureWeights, SimilarityResult, School } from '../types';
import styles from '../styles/Home.module.css';

export default function Home() {
  const [results, setResults] = useState<SimilarityResult[]>([]);
  const [allSchools, setAllSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [featureWeights, setFeatureWeights] = useState<FeatureWeights>(getDefaultFeatureWeights());
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [compareList, setCompareList] = useState<number[]>([]);
  const [showCompare, setShowCompare] = useState(false);

  // Load schools for filters
  useEffect(() => {
    fetch('/data/schools.json')
      .then(res => res.json())
      .then(data => setAllSchools(data))
      .catch(err => console.error('Error loading schools:', err));
  }, []);

  // Filter results based on current filters
  const filteredResults = useMemo(() => {
    if (results.length === 0) return [];

    const filteredSchools = applyFilters(
      results.map(r => r.school),
      filters
    );

    const filteredSchoolIds = new Set(filteredSchools.map(s => s.school_id));
    return results.filter(r => filteredSchoolIds.has(r.school.school_id));
  }, [results, filters]);

  // Get schools for comparison
  const compareSchools = useMemo(() => {
    return allSchools.filter(s => compareList.includes(s.school_id));
  }, [allSchools, compareList]);

  const handleSubmit = useCallback(async (studentProfile: StudentProfile) => {
    setLoading(true);
    setError(null);

    try {
      const response = await computeSimilarity(studentProfile, featureWeights, 20);
      setResults(response.results);
    } catch (err) {
      console.error('Error computing similarities:', err);
      if (err instanceof ApiRequestError) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [featureWeights]);

  const handleCompareToggle = useCallback((schoolId: number) => {
    setCompareList(prev => {
      if (prev.includes(schoolId)) {
        return prev.filter(id => id !== schoolId);
      }
      if (prev.length >= 4) {
        return prev; // Max 4 schools to compare
      }
      return [...prev, schoolId];
    });
  }, []);

  const handleRemoveFromCompare = useCallback((schoolId: number) => {
    setCompareList(prev => prev.filter(id => id !== schoolId));
  }, []);

  return (
    <div className={styles.container}>
      <Head>
        <title>School Recommendation System</title>
        <meta name="description" content="Find colleges that match your profile using AI-powered similarity matching" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#667eea" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      </Head>

      <ThemeToggle />

      <main className={styles.main}>
        <h1 className={styles.title}>School Recommendation System</h1>
        <p className={styles.description}>
          Find your perfect college match from 1,100+ US schools
        </p>

        <div className={styles.content}>
          <div className={styles.formSection}>
            <StudentForm
              onSubmit={handleSubmit}
              featureWeights={featureWeights}
              onWeightsChange={setFeatureWeights}
              isLoading={loading}
            />
          </div>

          <div className={styles.resultsSection}>
            {error && (
              <div className={styles.error}>
                {error}
              </div>
            )}

            {results.length > 0 && (
              <>
                <div className={styles.resultsHeader}>
                  <Filters
                    schools={allSchools}
                    filters={filters}
                    onFiltersChange={setFilters}
                  />

                  {compareList.length > 0 && (
                    <button
                      className={styles.compareButton}
                      onClick={() => setShowCompare(true)}
                    >
                      Compare ({compareList.length})
                    </button>
                  )}
                </div>

                {filteredResults.length > 0 ? (
                  <TopSchools
                    results={filteredResults}
                    compareList={compareList}
                    onCompareToggle={handleCompareToggle}
                  />
                ) : (
                  <div className={styles.noResults}>
                    No schools match your filters. Try adjusting them.
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>

      <Chatbot onResultsFound={setResults} />

      {showCompare && compareSchools.length > 0 && (
        <CompareSchools
          schools={compareSchools}
          onRemove={handleRemoveFromCompare}
          onClose={() => setShowCompare(false)}
        />
      )}
    </div>
  );
}
