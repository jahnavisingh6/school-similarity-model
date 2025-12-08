from sklearn.metrics.pairwise import cosine_similarity
import pandas as pd

def compute_similarity_matrix(features):
    """Compute cosine similarity between all school vectors."""
    return cosine_similarity(features)

def get_top_similar(df, features, school_index, top_n=5):
    """Return top N similar schools for a given school index."""
    sim_matrix = compute_similarity_matrix(features)
    sim_scores = list(enumerate(sim_matrix[school_index]))
    sim_scores = sorted(sim_scores, key=lambda x: x[1], reverse=True)
    
    top_similar = [df.iloc[i[0]]['school_name'] for i in sim_scores[1:top_n+1]]
    return top_similar
