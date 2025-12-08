import matplotlib.pyplot as plt
from sklearn.manifold import TSNE

def plot_tsne(features, labels, school_names):
    """Plot t-SNE clusters."""
    tsne = TSNE(n_components=2, random_state=42)
    tsne_results = tsne.fit_transform(features)
    
    plt.figure(figsize=(12,8))
    scatter = plt.scatter(tsne_results[:,0], tsne_results[:,1], c=labels, cmap='tab10')
    
    # Optional: annotate some points
    for i, name in enumerate(school_names):
        if i % 20 == 0:  # label every 20th school
            plt.text(tsne_results[i,0], tsne_results[i,1], name, fontsize=8)
    
    plt.title("t-SNE Clustering of Schools")
    plt.xlabel("TSNE-1")
    plt.ylabel("TSNE-2")
    plt.colorbar(scatter)
    plt.show()
