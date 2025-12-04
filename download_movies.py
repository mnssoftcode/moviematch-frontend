#!/usr/bin/env python3
"""
MovieMatch - Dataset Downloader
Downloads and processes the 9,800+ movie dataset from Hugging Face
Converts it to JSON format for use in the website
"""

import json
import requests
import pandas as pd
from datetime import datetime
import re

def download_movies_dataset():
    """Download the movie dataset from Hugging Face"""
    print("🎬 Downloading movie dataset from Hugging Face...")
    
    # URL for the raw CSV file
    url = "https://huggingface.co/datasets/Pablinho/movies-dataset/raw/main/9000plus.csv"
    
    try:
        # Download the CSV file
        response = requests.get(url)
        response.raise_for_status()
        
        # Save to local file
        with open('movies_raw.csv', 'w', encoding='utf-8') as f:
            f.write(response.text)
        
        print(f"✅ Downloaded {len(response.text.splitlines())} lines of data")
        return True
        
    except Exception as e:
        print(f"❌ Error downloading dataset: {e}")
        return False

def process_movies_data():
    """Process the raw CSV data and convert to JSON format"""
    print("🔄 Processing movie data...")
    
    try:
        # Read the CSV file
        df = pd.read_csv('movies_raw.csv')
        
        # Clean and process the data
        movies = []
        
        for index, row in df.iterrows():
            try:
                # Extract basic info
                title = str(row.get('Title', '')).strip()
                if not title or title == 'nan':
                    continue
                
                # Process genres
                genres_str = str(row.get('Genre', '')).strip()
                if genres_str == 'nan':
                    genres_str = 'Unknown'
                
                # Split genres and clean them
                genres = [genre.strip() for genre in genres_str.split(',') if genre.strip()]
                
                # Process release date
                release_date = str(row.get('Release_Date', '')).strip()
                if release_date == 'nan':
                    year = 'Unknown'
                else:
                    # Extract year from date
                    try:
                        year = str(pd.to_datetime(release_date).year)
                    except:
                        year = 'Unknown'
                
                # Process rating
                vote_average = row.get('Vote_Average', 0)
                if pd.isna(vote_average):
                    rating = 0.0
                else:
                    rating = float(vote_average)
                
                # Process overview
                overview = str(row.get('Overview', '')).strip()
                if overview == 'nan':
                    overview = 'No description available.'
                
                # Process poster URL
                poster_url = str(row.get('Poster_Url', '')).strip()
                if poster_url == 'nan' or not poster_url:
                    poster_url = None
                
                # Create movie object
                movie = {
                    'id': index + 1,
                    'title': title,
                    'year': year,
                    'rating': round(rating, 1),
                    'description': overview,
                    'tags': genres,
                    'poster': poster_url,
                    'release_date': release_date if release_date != 'nan' else None,
                    'vote_count': int(row.get('Vote_Count', 0)) if pd.notna(row.get('Vote_Count')) else 0
                }
                
                movies.append(movie)
                
            except Exception as e:
                print(f"⚠️ Error processing movie {index}: {e}")
                continue
        
        print(f"✅ Processed {len(movies)} movies successfully")
        return movies
        
    except Exception as e:
        print(f"❌ Error processing data: {e}")
        return []

def save_movies_json(movies):
    """Save the processed movies to a JSON file"""
    print("💾 Saving movies to JSON file...")
    
    try:
        # Create a more compact version for the website
        website_movies = []
        
        for movie in movies:
            # Only include movies with posters and good ratings
            if movie['poster'] and movie['rating'] > 0:
                website_movie = {
                    'id': movie['id'],
                    'title': movie['title'],
                    'year': movie['year'],
                    'rating': movie['rating'],
                    'description': movie['description'][:200] + '...' if len(movie['description']) > 200 else movie['description'],
                    'tags': movie['tags'][:5],  # Limit to 5 tags
                    'poster': movie['poster']
                }
                website_movies.append(website_movie)
        
        # Save to JSON file
        with open('movies_dataset.json', 'w', encoding='utf-8') as f:
            json.dump(website_movies, f, indent=2, ensure_ascii=False)
        
        print(f"✅ Saved {len(website_movies)} movies to movies_dataset.json")
        
        # Also create a smaller sample for testing
        sample_movies = website_movies[:50]  # First 50 movies
        with open('movies_sample.json', 'w', encoding='utf-8') as f:
            json.dump(sample_movies, f, indent=2, ensure_ascii=False)
        
        print(f"✅ Saved {len(sample_movies)} sample movies to movies_sample.json")
        
        return True
        
    except Exception as e:
        print(f"❌ Error saving JSON: {e}")
        return False

def generate_stats(movies):
    """Generate statistics about the dataset"""
    print("\n📊 === Dataset Statistics ===")
    print(f"Total movies: {len(movies)}")
    
    # Rating distribution
    ratings = [m['rating'] for m in movies if m['rating'] > 0]
    if ratings:
        print(f"Average rating: {sum(ratings) / len(ratings):.2f}")
        print(f"Highest rating: {max(ratings)}")
        print(f"Lowest rating: {min(ratings)}")
    
    # Year distribution
    years = [m['year'] for m in movies if m['year'] != 'Unknown']
    if years:
        years = [int(y) for y in years if y.isdigit()]
        if years:
            print(f"Year range: {min(years)} - {max(years)}")
    
    # Genre distribution
    all_genres = []
    for movie in movies:
        all_genres.extend(movie['tags'])
    
    genre_counts = {}
    for genre in all_genres:
        genre_counts[genre] = genre_counts.get(genre, 0) + 1
    
    print(f"\n🎭 Top 10 genres:")
    sorted_genres = sorted(genre_counts.items(), key=lambda x: x[1], reverse=True)
    for genre, count in sorted_genres[:10]:
        print(f"  {genre}: {count} movies")

def main():
    """Main function to download and process the dataset"""
    print("🎬 === MovieMatch Dataset Downloader ===")
    print("Downloading 9,800+ movies from Hugging Face...")
    print(f"Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    # Download the dataset
    if not download_movies_dataset():
        print("❌ Failed to download dataset")
        return
    
    # Process the data
    movies = process_movies_data()
    if not movies:
        print("❌ Failed to process movies data")
        return
    
    # Save to JSON
    if not save_movies_json(movies):
        print("❌ Failed to save JSON files")
        return
    
    # Generate statistics
    generate_stats(movies)
    
    print(f"\n🎉 Dataset processing completed successfully!")
    print(f"Finished at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("\n📁 Files created:")
    print("  - movies_dataset.json (main dataset)")
    print("  - movies_sample.json (sample for testing)")
    print("\n🚀 You can now run the website with: python3 -m http.server 8002")

if __name__ == "__main__":
    main() 