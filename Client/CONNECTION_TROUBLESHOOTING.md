# 🚨 Client-Server Connection Fix Guide

## 📋 Deployment Checklist

### **1. Backend Deployment (Server folder)**

**✅ Deploy Backend First:**
1. Vercel Dashboard → New Project
2. Import repository → Select `Server` folder
3. Deploy and note the URL (e.g., `https://pet-clinic-server-abc123.vercel.app`)

**✅ Backend Environment Variables (in Vercel):**
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/petclinic
JWT_SECRET=your-super-secret-jwt-key
NODE_ENV=production
CORS_ORIGIN=https://your-frontend-url.vercel.app
```

**✅ Test Backend:**
Visit: `https://your-backend-url.vercel.app/` 
Should show: "Server is running!"

### **2. Frontend Deployment (Client folder)**

**✅ Frontend Environment Variables (in Vercel):**
```
VITE_API_BASE_URL=https://your-backend-url.vercel.app
```

**⚠️ CRITICAL: No trailing slash in VITE_API_BASE_URL!**

### **3. Update Backend CORS**

After frontend deployment:
1. Get frontend URL (e.g., `https://pet-clinic-frontend-xyz789.vercel.app`)
2. Update backend environment variable:
   ```
   CORS_ORIGIN=https://pet-clinic-frontend-xyz789.vercel.app
   ```
3. Redeploy backend

## 🔧 Common Issues & Solutions

### **Issue 1: CORS Error**
```
Access to fetch at 'https://backend.vercel.app/api/...' from origin 'https://frontend.vercel.app' has been blocked by CORS policy
```

**Solution:**
- Update `CORS_ORIGIN` in backend Vercel environment variables
- Redeploy backend

### **Issue 2: Environment Variable Not Working**
```
TypeError: Failed to fetch
```

**Solution:**
- Check `VITE_API_BASE_URL` is set in frontend Vercel settings
- Redeploy frontend after setting env var
- Ensure no trailing slash in URL

### **Issue 3: Backend Not Accessible**
```
net::ERR_NAME_NOT_RESOLVED
```

**Solution:**
- Verify backend is deployed and running
- Check backend URL is correct
- Test backend directly: `https://your-backend-url.vercel.app/`

### **Issue 4: MongoDB Connection**
```
Failed to connect to MongoDB
```

**Solution:**
- Check `MONGODB_URI` in backend environment variables
- Ensure MongoDB Atlas allows connections from anywhere (0.0.0.0/0)
- Verify database credentials

## 🔍 Debugging Tools

### **1. Frontend Console Debug**
Add to browser console on deployed frontend:
```javascript
console.log('API URL:', import.meta.env.VITE_API_BASE_URL);
```

### **2. Network Tab**
- Open browser DevTools → Network tab
- Try logging in or making API calls
- Check if requests are going to correct backend URL

### **3. Backend Logs**
- Vercel Dashboard → Your Backend Project → Functions tab
- Check logs for errors

## 📞 Step-by-Step Connection Test

1. **Test Backend Direct:**
   - Visit: `https://your-backend-url.vercel.app/`
   - Should show: "Server is running!"

2. **Test API Endpoint:**
   - Visit: `https://your-backend-url.vercel.app/api/users`
   - Should return user data or authentication error

3. **Test from Frontend:**
   - Open frontend in browser
   - Open DevTools console
   - Run the diagnostic script

4. **Check Environment Variables:**
   - Frontend: Vercel Dashboard → Client Project → Settings → Environment Variables
   - Backend: Vercel Dashboard → Server Project → Settings → Environment Variables

## 🎯 Quick Fix Commands

If you need to redeploy:

```powershell
# Redeploy frontend
cd "c:\Users\Tal\Advanced_Web\Client"
npx vercel --prod

# Redeploy backend  
cd "c:\Users\Tal\Advanced_Web\Server"
npx vercel --prod
```

Remember: **Always deploy backend first, then update frontend with backend URL!**
