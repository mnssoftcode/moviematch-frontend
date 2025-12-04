# Deployment Guide for MovieMatch

This guide will help you deploy the MovieMatch application to Render.

## Prerequisites

1. A Render account (https://render.com)
2. A GitHub account
3. This repository pushed to GitHub (already done)

## Deploying the Backend (FastAPI)

1. Go to https://dashboard.render.com
2. Click "New+" and select "Web Service"
3. Connect your GitHub repository
4. Configure the service:
   - Name: `moviematch-backend`
   - Root Directory: `backend`
   - Runtime: `Python 3`
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `uvicorn server:app --host 0.0.0.0 --port $PORT`
5. Click "Create Web Service"

## Deploying the Frontend (Static Site)

1. Go to https://dashboard.render.com
2. Click "New+" and select "Static Site"
3. Connect your GitHub repository
4. Configure the site:
   - Name: `moviematch-frontend`
   - Build Command: `echo "Frontend build complete"`
   - Publish Directory: `.`
5. Add environment variable:
   - Key: `RENDER_BUILD_COMMAND`
   - Value: `echo "No build required for static site"`
6. Click "Create Static Site"

## Updating the Frontend with Backend URL

1. After your backend is deployed, copy the backend URL from Render dashboard
2. Update the `backendUrl` variable in `script.js` with your actual Render backend URL:
   ```javascript
   const backendUrl = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
       ? 'http://127.0.0.1:8000' 
       : 'https://your-actual-render-backend-url.onrender.com';
   ```
3. Commit and push the changes:
   ```bash
   git add script.js
   git commit -m "Update with Render backend URL"
   git push origin main
   ```

## Troubleshooting

If you encounter any issues:

1. Make sure all dependencies are correctly specified in `backend/requirements.txt`
2. Ensure the model files are properly tracked with Git LFS
3. Check Render logs for any error messages