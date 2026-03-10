# Deployment Setup

## Firebase Setup
1. Go to https://console.firebase.google.com and create a new project
2. Enable Firestore Database (start in production mode)
3. Go to Project Settings → Service Accounts → Generate new private key
4. Download the JSON file and extract these values for your environment variables:
   - FIREBASE_PROJECT_ID = project_id
   - FIREBASE_CLIENT_EMAIL = client_email
   - FIREBASE_PRIVATE_KEY = private_key

## Local Development
Copy `.env.local.example` to `.env.local` and fill in your Firebase credentials.
Run: `npm run dev`

## Vercel Deployment
1. Push this repo to GitHub
2. Import the repo on vercel.com
3. Add the three FIREBASE_* environment variables in Vercel project settings
4. Deploy

## Access Codes (change in Firestore after first run)
- Coach: coach2024
- Varsity: varsity2024
- Junior Varsity: jv2024
- Freshman: freshman2024

The config is auto-seeded to Firestore on first API call. To change codes/runners/routes,
edit the `config` → `main` document directly in the Firebase console.
