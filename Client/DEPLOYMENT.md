# Vercel Deployment Guide for FurEver Friends Pet Clinic

## Prerequisites
- Vercel account
- Your backend API deployed and accessible (e.g., on Vercel, Heroku, etc.)
- Environment variables configured

## Deployment Steps

### 1. Frontend Deployment (Client)

1. **Connect Repository to Vercel:**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "New Project"
   - Import your Git repository
   - Select the `Client` folder as the root directory

2. **Configure Build Settings:**
   - Framework Preset: `Vite`
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

3. **Set Environment Variables:**
   - In Vercel dashboard, go to your project settings
   - Navigate to "Environment Variables"
   - Add the following variable:
     ```
     VITE_API_BASE_URL = https://your-backend-api-url.vercel.app
     ```
   - Replace `your-backend-api-url.vercel.app` with your actual backend URL

### 2. Backend Deployment (Server)

1. **Deploy Backend First:**
   - Deploy your `Server` folder to Vercel or another hosting platform
   - Note the deployed backend URL

2. **Configure Backend Environment Variables:**
   - Set up your MongoDB connection string
   - Configure JWT secrets
   - Set CORS origins to include your frontend domain

### 3. Update Environment Variables

After backend deployment:
1. Update `VITE_API_BASE_URL` in Vercel frontend settings
2. Ensure the URL doesn't end with a trailing slash
3. Redeploy frontend if needed

## Environment Variables Reference

### Frontend (.env)
```bash
VITE_API_BASE_URL=https://your-backend-api-url.vercel.app
```

### Backend (.env)
```bash
MONGODB_URI=your-mongodb-connection-string
JWT_SECRET=your-jwt-secret
PORT=3000
CORS_ORIGIN=https://your-frontend-url.vercel.app
```

## Verification

After deployment:
1. Check that all API calls work correctly
2. Verify image uploads and displays work
3. Test authentication flow
4. Ensure all features function as expected

## Troubleshooting

- **CORS Issues:** Make sure backend CORS is configured for your frontend domain
- **Environment Variables:** Ensure all required env vars are set in production
- **Build Errors:** Check build logs for missing dependencies or TypeScript errors
- **API Connection:** Verify the backend URL is correct and accessible

## Files Modified for Deployment

The following files were updated to use environment variables:

### Services:
- `appointmentService.ts`
- `patientService.ts`
- `petService.ts`
- `prescriptionService.ts`
- `staffService.ts`
- `statisticsService.ts`
- `userService.ts`

### Components:
- `Login.tsx`
- `SignUpForm.tsx`
- `StaffManagement.tsx`
- `StaffGrid.tsx`
- `StaffCard.tsx`
- `AppointmentView.tsx`
- `TeamSection.tsx`
- `ChatWindow.tsx`
- `UnfulfilledPrescriptions.tsx`
- `TreatmentHistory.tsx`
- `ShowPrescriptions.tsx`
- `PetImageUpload.tsx`
- `PetCard.tsx`
- `ClientProfile.tsx`
- `AddAppointmentFormToClient.tsx`

### Configuration:
- `config/api.ts` - Centralized API configuration
- `.env.example` - Development environment template
- `.env.production.example` - Production environment template
- `vercel.json` - Vercel deployment configuration
