# Render.com Deployment Guide

This guide will help you deploy the HerStories platform to Render.com.

## Overview

You'll create **two separate services** on Render:
1. **Backend Service** (Express.js API)
2. **Frontend Service** (Vite + React static site)

---

## Step-by-Step Deployment

### Phase 1: Deploy Backend First

1. **Go to Render Dashboard**
   - Visit https://dashboard.render.com
   - Click **"New +"** → **"Web Service"**

2. **Connect Repository**
   - Select your GitHub repository: `HerStories`
   - Click **"Connect"**

3. **Configure Backend Service**

   | Setting | Value |
   |---------|-------|
   | **Name** | `herstories-backend` |
   | **Region** | Oregon (or closest to you) |
   | **Branch** | `main` |
   | **Root Directory** | `backend` |
   | **Runtime** | `Node` |
   | **Build Command** | `npm install` |
   | **Start Command** | `npm start` |
   | **Instance Type** | `Free` |

4. **Add Environment Variables**

   Click **"Advanced"** → **"Add Environment Variable"** for each:

   | Key | Value |
   |-----|-------|
   | `NODE_ENV` | `production` |
   | `PORT` | `3001` |
   | `JWT_SECRET` | `your-secure-random-string-here` (use a generator) |
   | `DATABASE_PATH` | `/opt/render/project/src/db/herstories.db` |
   | `FRONTEND_URL` | *(leave empty for now, update after frontend deployment)* |

5. **Click "Create Web Service"**

6. **Wait for Deployment**
   - Render will build and deploy your backend
   - Once complete, you'll see a URL like: `https://herstories-backend-xxxx.onrender.com`
   - **Copy this URL** - you'll need it for the frontend!

---

### Phase 2: Deploy Frontend

1. **Go to Render Dashboard**
   - Click **"New +"** → **"Static Site"**

2. **Connect Repository**
   - Select the same GitHub repository: `HerStories`
   - Click **"Connect"**

3. **Configure Frontend Service**

   | Setting | Value |
   |---------|-------|
   | **Name** | `herstories-frontend` |
   | **Region** | Oregon (same as backend) |
   | **Branch** | `main` |
   | **Root Directory** | `frontend` |
   | **Build Command** | `npm install && npm run build` |
   | **Publish Directory** | `dist` |
   | **Instance Type** | `Free` |

4. **Add Environment Variables**

   | Key | Value |
   |-----|-------|
   | `VITE_API_URL` | `https://herstories-backend-xxxx.onrender.com/api` |

   ⚠️ **Important**: Replace `herstories-backend-xxxx.onrender.com` with your actual backend URL from Phase 1

5. **Click "Create Static Site"**

6. **Wait for Deployment**
   - Render will build your frontend
   - Once complete, you'll see a URL like: `https://herstories-frontend-xxxx.onrender.com`
   - **This is your live app URL!**

---

### Phase 3: Update Backend CORS

1. **Go back to Backend Service**
   - In Render dashboard, click on `herstories-backend`

2. **Update Environment Variables**
   - Add/Edit `FRONTEND_URL` with your frontend URL:
   - Value: `https://herstories-frontend-xxxx.onrender.com`

3. **Click "Save Changes"**
   - The backend will automatically redeploy

---

## Testing Your Deployment

### 1. Check Backend Health
Visit: `https://herstories-backend-xxxx.onrender.com/api/health`

You should see:
```json
{
  "status": "ok",
  "timestamp": "2025-..."
}
```

### 2. Check Frontend
Visit: `https://herstories-frontend-xxxx.onrender.com`

You should see the HerStories homepage.

### 3. Test Admin Login
- Click "Login" → Enter credentials
- Email: `admin@herstories.org`
- Password: `admin123`

---

## Important Notes

### ⚠️ Database Persistence on Free Tier

Render's free tier has **ephemeral storage**. The SQLite database will be **deleted** when:
- The service redeploys
- The service is idle for too long (free tier spins down after 15 minutes)

**Solutions:**
1. **Upgrade to Paid Plan** - Persistent storage included
2. **Use External Database** - Migrate to PostgreSQL (Render offers free PostgreSQL)
3. **Accept the limitation** - For demos/testing only

### 🔄 Auto-Deploy on Git Push

Both services are connected to your `main` branch. Any push to GitHub will automatically:
1. Rebuild the backend
2. Rebuild the frontend
3. Deploy both services

### 📝 Environment Variables

Keep these secure! Never commit `.env` files to GitHub. The values in `render.yaml` are templates only.

---

## Troubleshooting

### Frontend shows "Failed to load stories"
- Check that `VITE_API_URL` points to your backend
- Verify backend is running (check health endpoint)
- Check Render logs for errors

### Backend crashes on startup
- Check Render logs: Dashboard → Backend → Logs
- Common issues:
  - Missing environment variables
  - Database path incorrect
  - Dependencies not installing

### Database is empty after deploy
- The `postinstall` script should auto-initialize
- Check logs for database initialization messages
- Verify `DATABASE_PATH` is set correctly

### CORS errors in browser console
- Ensure `FRONTEND_URL` is set in backend environment variables
- Must match exact frontend URL (no trailing slash)

---

## Optional: Use render.yaml for One-Click Deploy

Instead of manual setup, you can use the `render.yaml` file:

```bash
# Install Render CLI
npm install -g @render-cloud/cli

# Login to Render
render login

# Deploy using render.yaml
render up
```

This will create both services automatically with all settings from the YAML file.

---

## Cost Estimate (Free Tier)

| Service | Cost |
|---------|------|
| Backend (Free) | $0/month (spins down after 15 min idle) |
| Frontend (Free) | $0/month |
| **Total** | **$0/month** |

Note: Free tier services may have slower cold starts.

---

## Next Steps After Deployment

1. **Change Admin Password** - Update from default `admin123`
2. **Set Custom Domain** - Render supports custom domains on paid plans
3. **Enable HTTPS** - Automatic on Render
4. **Monitor Logs** - Check Render dashboard regularly
5. **Backup Database** - Download SQLite file periodically or migrate to PostgreSQL

---

## Support

- Render Docs: https://render.com/docs
- Render Community: https://community.render.com
- Project Issues: Your GitHub repository
