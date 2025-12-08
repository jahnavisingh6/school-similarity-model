import pandas as pd
from sklearn.preprocessing import StandardScaler

def load_and_clean(path):
    """Load CSV and clean data."""
    df = pd.read_csv(path)
    df = df.drop_duplicates()
    df = df.fillna(df.median(numeric_only=True))
    return df

def scale_features(df, feature_cols):
    """Scale numeric features."""
    scaler = StandardScaler()
    scaled = scaler.fit_transform(df[feature_cols])
    return scaled, scaler

