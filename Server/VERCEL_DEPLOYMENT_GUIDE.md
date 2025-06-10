# 🚀 Vercel Deployment Instructions with Your Credentials

## 📋 Your Environment Variables Are Ready!

Your `.env` file now contains all the necessary credentials. Here's what you need to set in Vercel:

## 🔧 **Backend Deployment (Server folder)**

### **Step 1: Deploy Backend to Vercel**
1. Go to [vercel.com](https://vercel.com) → New Project
2. Import your Git repository
3. **Select `Server` folder** as root directory
4. Deploy

### **Step 2: Set Environment Variables in Vercel Dashboard**
Go to your backend project → Settings → Environment Variables and add:

```
MONGODB_URI = mongodb+srv://matantal606:J5nkatYMwxolefOd@petclinic.zj4wsof.mongodb.net/FurEverFriends?retryWrites=true&w=majority&appName=petclinic

JWT_SECRET = 2]jd`R1$9%A-95:Hk>&l}@'Kg,u%{ck_

EMAIL_USER = fureverfriendspetclinic@gmail.com

EMAIL_PASS = vxel ivkp jear qtqd

NODE_ENV = production

CORS_ORIGIN = https://your-frontend-url.vercel.app
```

### **Step 3: Test Backend**
After deployment, visit: `https://your-backend-url.vercel.app/`
Should show: "Server is running!"

## 🖥️ **Frontend Deployment (Client folder)**

### **Step 1: Deploy Frontend**
1. Vercel → New Project
2. Import same repository
3. **Select `Client` folder** as root directory
4. Deploy

### **Step 2: Set Frontend Environment Variable**
In frontend project → Settings → Environment Variables:

```
VITE_API_BASE_URL = https://your-backend-url.vercel.app
```

### **Step 3: Update Backend CORS**
After frontend deployment:
1. Get your frontend URL (e.g., `https://pet-clinic-frontend-abc123.vercel.app`)
2. Update backend environment variable:
   ```
   CORS_ORIGIN = https://pet-clinic-frontend-abc123.vercel.app
   ```
3. Redeploy backend

## ✅ **Verification Checklist**

1. **Backend Health Check:**
   - Visit: `https://your-backend-url.vercel.app/`
   - Should show: "Server is running!"

2. **API Endpoint Test:**
   - Visit: `https://your-backend-url.vercel.app/api/staff`
   - Should return JSON data or authentication error

3. **Frontend Connection:**
   - Open frontend and check browser console
   - Should see successful API calls without CORS errors

## 🔄 **Quick Deployment Commands**

If you prefer using Vercel CLI:

```powershell
# Deploy backend
cd "c:\Users\Tal\Advanced_Web\Server"
npx vercel --prod

# Deploy frontend
cd "c:\Users\Tal\Advanced_Web\Client"
npx vercel --prod
```

## 🔍 **If You Still Get Errors**

**Common Issues:**
1. **CORS Error:** Make sure `CORS_ORIGIN` matches your frontend URL exactly
2. **404 Error:** Verify all environment variables are set in Vercel dashboard
3. **MongoDB Error:** Check that your MongoDB Atlas allows connections from anywhere (0.0.0.0/0)

**Debug Steps:**
1. Check Vercel function logs for backend errors
2. Use browser DevTools → Network tab to see failed requests
3. Test backend endpoints directly in browser

Your credentials are now properly configured and ready for deployment! 🎉
