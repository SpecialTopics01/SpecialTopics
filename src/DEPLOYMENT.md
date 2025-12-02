# 🚀 Emergency Connect - Deployment Guide

## Recommended Deployment Options

### Option 1: Vercel (Recommended - Easiest & Free)

Vercel is perfect for React apps and offers free hosting with automatic HTTPS.

#### Steps:

1. **Push your code to GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/YOUR-USERNAME/emergency-connect.git
   git push -u origin main
   ```

2. **Deploy to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Sign up with your GitHub account
   - Click "New Project"
   - Import your GitHub repository
   - Vercel will auto-detect Vite settings
   - Click "Deploy"

3. **Your app will be live at:**
   ```
   https://emergency-connect.vercel.app
   ```

#### Vercel Configuration (Optional):

Create `vercel.json` in your project root:
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

---

### Option 2: Netlify (Also Free & Easy)

Another excellent option with similar features to Vercel.

#### Steps:

1. **Push code to GitHub** (same as above)

2. **Deploy to Netlify:**
   - Go to [netlify.com](https://netlify.com)
   - Sign up with GitHub
   - Click "Add new site" → "Import an existing project"
   - Select your repository
   - Build settings:
     - Build command: `npm run build`
     - Publish directory: `dist`
   - Click "Deploy"

3. **Your app will be live at:**
   ```
   https://emergency-connect.netlify.app
   ```

#### Netlify Configuration (Optional):

Create `netlify.toml` in your project root:
```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

---

### Option 3: GitHub Pages (Free)

Good for static sites, but requires more setup for SPAs.

#### Steps:

1. **Install gh-pages:**
   ```bash
   npm install --save-dev gh-pages
   ```

2. **Update package.json:**
   ```json
   {
     "homepage": "https://YOUR-USERNAME.github.io/emergency-connect",
     "scripts": {
       "predeploy": "npm run build",
       "deploy": "gh-pages -d dist"
     }
   }
   ```

3. **Update vite.config.ts:**
   ```typescript
   export default defineConfig({
     base: '/emergency-connect/',
     plugins: [react()],
   })
   ```

4. **Deploy:**
   ```bash
   npm run deploy
   ```

5. **Enable GitHub Pages:**
   - Go to your repo → Settings → Pages
   - Source: Deploy from branch
   - Branch: gh-pages
   - Save

---

## 🔒 Important: HTTPS Required for WebRTC

**WebRTC video calling requires HTTPS (or localhost).** All the deployment options above provide automatic HTTPS, so your video calling will work perfectly.

---

## 🌐 Custom Domain (Optional)

### For Vercel:
1. Go to your project settings
2. Click "Domains"
3. Add your custom domain (e.g., `emergency.yourdomain.com`)
4. Update DNS records as instructed

### For Netlify:
1. Go to Site settings → Domain management
2. Add custom domain
3. Update DNS records

---

## 📱 Making It Accessible Anywhere

Once deployed, your app will be accessible from:
- ✅ Any computer with internet
- ✅ Any mobile device (iOS/Android)
- ✅ Any tablet
- ✅ Any location worldwide

**Share your deployment URL:**
```
Citizens: https://your-app.vercel.app
Admins: https://your-app.vercel.app/admin
```

---

## 🔧 Pre-Deployment Checklist

Before deploying, make sure:

- [ ] Supabase database is set up with all tables
- [ ] Emergency teams data is seeded
- [ ] Google Maps API key is configured
- [ ] Supabase credentials are in `lib/supabase.ts`
- [ ] All SQL scripts have been run in Supabase
- [ ] Test the app locally first (`npm run dev`)

---

## 🚨 Production Considerations

### 1. Environment Variables (If Needed Later)

If you want to hide API keys (optional for now since they're public keys):

**Create `.env` file:**
```env
VITE_SUPABASE_URL=https://pdzttgkijnmhavckqpos.supabase.co
VITE_SUPABASE_ANON_KEY=your_key_here
VITE_GOOGLE_MAPS_KEY=AIzaSyBUV8Ag1aOioVL3SErpMIItjsGAbnE9sR4
```

**Update `lib/supabase.ts`:**
```typescript
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
export const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_KEY
```

**Add to Vercel/Netlify:**
- Go to project settings → Environment Variables
- Add each variable

### 2. TURN Servers for WebRTC (Optional)

For better connectivity in restrictive networks, add TURN servers:

```typescript
const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { 
      urls: 'turn:your-turn-server.com:3478',
      username: 'username',
      credential: 'password'
    }
  ]
}
```

Free TURN server options:
- [Twilio STUN/TURN](https://www.twilio.com/stun-turn)
- [Xirsys](https://xirsys.com/)

### 3. Analytics (Optional)

Add Google Analytics or similar to track usage:
```bash
npm install @vercel/analytics
```

---

## 📊 Monitoring Your Deployment

### Vercel Dashboard:
- Real-time deployment logs
- Performance metrics
- Error tracking
- Usage statistics

### Netlify Dashboard:
- Build logs
- Deploy previews
- Form submissions
- Analytics

---

## 🐛 Troubleshooting Deployment

### Build Fails?
```bash
# Test build locally first
npm run build

# Check for TypeScript errors
npm run build 2>&1 | grep error
```

### WebRTC Not Working?
- Ensure HTTPS is enabled (automatic on Vercel/Netlify)
- Check browser console for errors
- Verify camera/microphone permissions

### Map Not Loading?
- Verify Google Maps API key is correct
- Check API key restrictions in Google Cloud Console
- Ensure billing is enabled for Google Maps

---

## 🎉 Quick Deploy Commands

**Vercel (via CLI):**
```bash
npm install -g vercel
vercel login
vercel
```

**Netlify (via CLI):**
```bash
npm install -g netlify-cli
netlify login
netlify deploy --prod
```

---

## 📞 Post-Deployment

1. **Test all features:**
   - User registration (citizen & admin)
   - Login/logout
   - Map loading
   - Location tracking
   - Video calling
   - Bookmarks
   - Call history

2. **Share with users:**
   - Send deployment URL
   - Provide user guide
   - Collect feedback

3. **Monitor:**
   - Check deployment logs
   - Monitor error rates
   - Track user activity

---

## 🔗 Useful Links

- [Vercel Documentation](https://vercel.com/docs)
- [Netlify Documentation](https://docs.netlify.com)
- [Supabase Documentation](https://supabase.com/docs)
- [WebRTC Documentation](https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API)

---

## 💡 Pro Tips

1. **Use Vercel** - It's the easiest and most reliable for React/Vite apps
2. **Enable automatic deployments** - Every git push deploys automatically
3. **Use preview deployments** - Test changes before going live
4. **Set up custom domain** - Makes it more professional
5. **Enable analytics** - Track usage and performance

Your Emergency Connect app will be live and accessible worldwide in minutes! 🚀
