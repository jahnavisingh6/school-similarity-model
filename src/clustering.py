from sklearn.cluster import KMeans

def cluster_schools(features, n_clusters=5):
    """Apply K-Means clustering to the feature matrix."""
    kmeans = KMeans(n_clusters=n_clusters, random_state=42)
    labels = kmeans.fit_predict(features)
    return labels, kmeans
