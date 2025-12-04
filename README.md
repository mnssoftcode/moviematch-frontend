# MovieMatch - Movie Recommendation Website

A modern, responsive movie recommendation website built with HTML, CSS, and JavaScript. Users can select multiple tags to get personalized movie recommendations based on their interests.

## Features

### 🎯 Tag-Based Recommendations
- **30+ Available Tags**: Choose from a wide variety of genres and themes including Action, Drama, Sci-Fi, Thriller, Comedy, and more
- **Multiple Selection**: Select multiple tags to get more personalized recommendations
- **Smart Filtering**: Movies are filtered based on tag matches and sorted by rating

### 🎬 Movie Information
- **Comprehensive Details**: Each movie includes title, year, rating, description, cast, and director
- **Visual Ratings**: Star-based rating system for easy comparison
- **Tag Display**: See all relevant tags for each movie
- **Modal Details**: Click any movie card to view detailed information in a beautiful modal

### 🎨 Modern UI/UX
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile devices
- **Smooth Animations**: Hover effects, transitions, and loading animations
- **Glass Morphism**: Modern backdrop blur effects and translucent elements
- **Beautiful Gradients**: Eye-catching color schemes and visual appeal

### ⚡ Interactive Features
- **Tag Toggle**: Click tags to select/deselect them
- **Clear All**: Reset all selected tags with one click
- **Loading States**: Visual feedback during recommendation generation
- **Keyboard Support**: Close modals with Escape key
- **Smooth Scrolling**: Automatic scroll to results after selection

### 🤖 AI-Powered Mood Analysis
- **Natural Language Processing**: Describe your mood in plain English
- **Intelligent Genre Prediction**: AI model predicts the best genres for your mood
- **Fallback System**: Rule-based system if AI is unavailable

## How to Use

1. **Open the Website**: Open `index.html` in your web browser
2. **Select Tags**: Click on the tags that interest you (you can select multiple)
3. **Get Recommendations**: Click "Get Recommendations" to see matching movies
4. **View Details**: Click on any movie card to see detailed information
5. **Try Different Tags**: Use "Clear All" to reset and try different combinations

## Sample Movies Included

The website includes 12 popular movies with diverse genres:

- **Inception** (Sci-Fi, Thriller, Mind-bending)
- **The Shawshank Redemption** (Drama, Prison, Friendship)
- **The Dark Knight** (Superhero, Action, Drama)
- **Pulp Fiction** (Crime, Drama, Quentin Tarantino)
- **Forrest Gump** (Drama, Romance, Historical)
- **The Matrix** (Sci-Fi, Action, Cyberpunk)
- **Goodfellas** (Crime, Drama, Mafia)
- **The Silence of the Lambs** (Thriller, Horror, Crime)
- **Fight Club** (Drama, Psychological, Cult Classic)
- **The Lord of the Rings** (Fantasy, Adventure, Epic)
- **Interstellar** (Sci-Fi, Space, Drama)
- **The Grand Budapest Hotel** (Comedy, Drama, Wes Anderson)

## Available Tags

- **Genres**: Action, Drama, Comedy, Thriller, Sci-Fi, Horror, Romance, Adventure, Crime, Fantasy, Mystery, Animation, Documentary, War, Western, Musical, Biography, History, Sport, Family
- **Themes**: Superhero, Mind-bending, Cult Classic, Feel-good, Epic, Psychological, Suspense, Violence, Friendship, Redemption

## Technical Details

### File Structure
```
movies-recommendation/
├── index.html          # Main HTML structure
├── styles.css          # CSS styling and animations
├── script.js           # JavaScript functionality
├── README.md           # This file
├── backend/            # AI Backend
│   ├── server.py       # FastAPI server
│   ├── requirements.txt # Python dependencies
│   └── tag2idx.json    # Genre mapping
└── render.yaml         # Render deployment config
```

### Technologies Used
- **HTML5**: Semantic structure and accessibility
- **CSS3**: Modern styling with Flexbox, Grid, and animations
- **JavaScript (ES6+)**: Interactive functionality and data management
- **Font Awesome**: Icons for enhanced UI
- **Google Fonts**: Inter font family for modern typography
- **FastAPI**: Backend framework for AI model serving
- **PyTorch/Transformers**: AI model for mood analysis

### Browser Compatibility
- Chrome (recommended)
- Firefox
- Safari
- Edge
- Mobile browsers

## Deployment

### Deploying to Render

1. **Create a GitHub Repository**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/yourusername/moviematch.git
   git push -u origin main
   ```

2. **Deploy Backend to Render**
   - Go to [Render Dashboard](https://dashboard.render.com/)
   - Click "New+" and select "Web Service"
   - Connect your GitHub repository
   - Set:
     - Name: `moviematch-backend`
     - Root Directory: `backend`
     - Runtime: `Python 3`
     - Build Command: `pip install -r requirements.txt`
     - Start Command: `uvicorn server:app --host 0.0.0.0 --port $PORT`
   - Click "Create Web Service"

3. **Deploy Frontend to Render**
   - Go to [Render Dashboard](https://dashboard.render.com/)
   - Click "New+" and select "Static Site"
   - Connect your GitHub repository
   - Set:
     - Name: `moviematch-frontend`
     - Build Command: `echo "Frontend build complete"`
     - Publish Directory: `.`
   - Add environment variable:
     - Key: `RENDER_BUILD_COMMAND`
     - Value: `echo "No build required for static site"`
   - Click "Create Static Site"

4. **Update Frontend with Backend URL**
   - After your backend is deployed, copy the backend URL from Render
   - Update the `backendUrl` in `script.js` with your actual Render backend URL
   - Commit and push the changes

## Local Development

### Running the Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn server:app --reload
```

### Running the Frontend
Simply open `index.html` in your browser, or run a local server:
```bash
python3 -m http.server 8000
```

## Customization

### Adding More Movies
To add more movies, edit the `movies` array in `script.js`:

```javascript
const movies = [
    {
        id: 13,
        title: "Your Movie Title",
        year: 2024,
        rating: 8.5,
        description: "Movie description here...",
        tags: ["Action", "Drama", "Your Tag"],
        cast: "Actor 1, Actor 2, Actor 3",
        director: "Director Name"
    },
    // ... more movies
];
```

### Adding New Tags
To add new tags, edit the `availableTags` array in `script.js`:

```javascript
const availableTags = [
    "Action", "Drama", "Your New Tag", // ... existing tags
];
```

### Styling Customization
Modify `styles.css` to change colors, fonts, or layout:

```css
:root {
    --primary-color: #667eea;
    --secondary-color: #764ba2;
    --text-color: #333;
    --background-color: #f8f9fa;
}
```

## Features in Detail

### Tag Selection System
- Visual feedback when tags are selected
- Hover effects for better user interaction
- Clear visual distinction between selected and unselected tags
- Responsive grid layout that adapts to screen size

### Movie Recommendation Algorithm
- Matches user-selected tags with movie tags
- Case-insensitive matching for better results
- Sorts results by rating (highest first)
- Shows count of found movies

### Modal System
- Detailed movie information display
- Responsive design for all screen sizes
- Multiple ways to close (X button, outside click, Escape key)
- Smooth animations and transitions

### Loading States
- Professional loading spinner
- Simulated delay for realistic experience
- Backdrop blur effect during loading
- Clear user feedback

## Future Enhancements

Potential improvements for the website:

1. **Real Movie Posters**: Integrate with movie API for actual poster images
2. **User Accounts**: Save favorite movies and preferences
3. **Advanced Filtering**: Filter by year, rating range, or director
4. **Movie Trailers**: Embed YouTube trailers in movie details
5. **Social Features**: Share recommendations with friends
6. **Dark Mode**: Toggle between light and dark themes
7. **Search Functionality**: Search movies by title or cast
8. **Pagination**: Handle large movie databases efficiently

## Getting Started

1. Download or clone the project files
2. Open `index.html` in your web browser
3. Start selecting tags and exploring movie recommendations!

No server setup required - this is a pure frontend application that runs entirely in the browser.

---

**Enjoy discovering your next favorite movie! 🎬✨**