import pandas as pd
import json
import ast
import os
from datetime import datetime

# === Check files exist ===
required_files = [
    "movies_raw.csv",
    "movies_metadata.csv",
    "keywords.csv",
    "links.csv"
]
for file in required_files:
    if not os.path.exists(file):
        raise FileNotFoundError(f"Required file not found: {file}")

# === Load and clean HuggingFace dataset ===
huggingface_df = pd.read_csv("movies_raw.csv")

huggingface_movies = []
for idx, row in huggingface_df.iterrows():
    title = str(row.get("Title", "")).strip()
    if not title or title.lower() == "nan":
        continue

    year = str(pd.to_datetime(row.get("Release_Date", ""), errors='coerce').year) if pd.notna(row.get("Release_Date")) else "Unknown"
    genres = [g.strip() for g in str(row.get("Genre", "")).split(",") if g.strip()]
    overview = str(row.get("Overview", "")).strip()
    if not overview or overview.lower() == "nan":
        overview = "No description available."
    # Robust rating parsing
    vote_average = row.get("Vote_Average", 0)
    try:
        rating = float(vote_average)
    except (ValueError, TypeError):
        rating = 0.0
    poster = str(row.get("Poster_Url", "")).strip()
    if not poster or poster.lower() == "nan":
        continue

    huggingface_movies.append({
        "title": title,
        "year": year,
        "rating": round(rating, 1),
        "description": overview[:200] + "..." if len(overview) > 200 else overview,
        "tags": genres[:5],
        "poster": poster,
        "source": "HuggingFace"
    })

# === Load and clean Kaggle metadata ===
metadata_df = pd.read_csv("movies_metadata.csv", low_memory=False)
keywords_df = pd.read_csv("keywords.csv")
links_df = pd.read_csv("links.csv")

metadata_df["id"] = pd.to_numeric(metadata_df["id"], errors="coerce").fillna(0).astype(int)
keywords_df["id"] = pd.to_numeric(keywords_df["id"], errors="coerce").fillna(0).astype(int)
links_df["tmdbId"] = pd.to_numeric(links_df["tmdbId"], errors="coerce").fillna(0).astype(int)

# Map TMDB id to keywords
tmdb_to_keywords = {}
for _, row in keywords_df.iterrows():
    try:
        keywords = ast.literal_eval(row["keywords"])
        tmdb_to_keywords[row["id"]] = [k["name"] for k in keywords if "name" in k]
    except:
        tmdb_to_keywords[row["id"]] = []

def parse_genres(genres_str):
    try:
        return [g["name"] for g in ast.literal_eval(genres_str)]
    except:
        return []

kaggle_movies = []
valid_tmdb_ids = set(links_df["tmdbId"])

for _, row in metadata_df.iterrows():
    tmdb_id = row["id"]
    if tmdb_id not in valid_tmdb_ids:
        continue

    title = str(row.get("title", "")).strip()
    if not title or title.lower() == "nan":
        continue

    year = str(pd.to_datetime(row.get("release_date", ""), errors='coerce').year) if pd.notna(row.get("release_date")) else "Unknown"
    genres = parse_genres(row.get("genres", "[]"))
    keywords = tmdb_to_keywords.get(tmdb_id, [])
    tags = list(set(genres + keywords))[:5]
    overview = str(row.get("overview", "")).strip()
    if not overview or overview.lower() == "nan":
        overview = "No description available."
    rating = float(row.get("vote_average", 0.0) or 0.0)
    poster_path = str(row.get("poster_path", "")).strip()
    if not poster_path or poster_path.lower() == "nan":
        continue
    poster_url = f"https://image.tmdb.org/t/p/original{poster_path}"

    kaggle_movies.append({
        "title": title,
        "year": year,
        "rating": round(rating, 1),
        "description": overview[:200] + "..." if len(overview) > 200 else overview,
        "tags": tags,
        "poster": poster_url,
        "source": "Kaggle"
    })

# === Merge both lists ===
combined_movies = huggingface_movies + kaggle_movies

# Add unique IDs
for idx, movie in enumerate(combined_movies, start=1):
    movie["id"] = idx

# Save to final JSON
with open("movies_combined.json", "w", encoding="utf-8") as f:
    json.dump(combined_movies, f, indent=2, ensure_ascii=False)

print(f"✅ Saved {len(combined_movies)} movies to movies_combined.json") 