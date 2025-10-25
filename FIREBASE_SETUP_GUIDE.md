# Firebase Setup Guide for WeFix.lk App

## Current Status
Your app is running in **Demo Mode** with mock Firebase credentials. This means:
- ❌ Password reset emails are **NOT** sent
- ❌ User data is stored locally in AsyncStorage (not synced)
- ❌ No push notifications
- ✅ Authentication works locally for testing

## To Enable Real Firebase Features

### Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add Project" or select an existing project
3. Follow the setup wizard
4. Enable Google Analytics (optional)

### Step 2: Register Your App

1. In your Firebase project, click the **Web** icon (</>) to add a web app
2. Enter app nickname: `WeFix.lk`
3. Check "Also set up Firebase Hosting" (optional)
4. Click "Register app"

### Step 3: Get Your Firebase Configuration

After registering, you'll see your Firebase config object:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyC...",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

### Step 4: Enable Firebase Authentication

1. In Firebase Console, go to **Authentication** → **Sign-in method**
2. Enable **Email/Password** authentication
3. Click **Save**

### Step 5: Configure Email Templates (for Password Reset)

1. Go to **Authentication** → **Templates**
2. Click on **Password reset** template
3. Customize the email template (optional)
4. Click **Save**

### Step 6: Set Authorized Domains

1. Go to **Authentication** → **Settings** → **Authorized domains**
2. Add your deployment domains:
   - `localhost` (for development)
   - `fixapp-3.preview.emergentagent.com` (your current preview URL)
   - Your production domain (when deployed)

### Step 7: Create Firestore Database

1. Go to **Firestore Database** in Firebase Console
2. Click **Create database**
3. Choose **Start in production mode** (or test mode for development)
4. Select a location (choose closest to Sri Lanka, e.g., `asia-south1`)
5. Click **Enable**

### Step 8: Set Up Security Rules

In Firestore, set up basic security rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // User profiles
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Bookings - users can only access their own
    match /bookings/{bookingId} {
      allow read, write: if request.auth != null && 
                            resource.data.userId == request.auth.uid;
      allow create: if request.auth != null;
    }
    
    // Products - read-only for all authenticated users
    match /products/{productId} {
      allow read: if request.auth != null;
    }
  }
}
```

### Step 9: Add Firebase Credentials to Your App

1. Open `/app/frontend/.env` file
2. Add your Firebase credentials:

```env
# Existing variables (DO NOT MODIFY)
EXPO_TUNNEL_SUBDOMAIN=fixapp
EXPO_PACKAGER_HOSTNAME=https://naming-consistency-1.preview.emergentagent.com
EXPO_PUBLIC_BACKEND_URL=https://naming-consistency-1.preview.emergentagent.com
EXPO_USE_FAST_RESOLVER="1"
METRO_CACHE_ROOT=/app/frontend/.metro-cache

# Add Firebase Configuration (REPLACE WITH YOUR VALUES)
EXPO_PUBLIC_FIREBASE_API_KEY=AIzaSyC...
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
EXPO_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123
```

### Step 10: Restart the App

After adding credentials, restart the Expo development server:

```bash
sudo supervisorctl restart expo
```

## Verification

Once configured, you'll see in logs:
```
✅ Firebase initialized: Production Mode
```

Instead of:
```
✅ Firebase initialized: Demo Mode
```

## Testing Password Reset

1. Register a new user with a real email address
2. Go to Login screen → Click "Forgot Password?"
3. Enter the registered email
4. Check your inbox (and spam folder)
5. Click the reset link in the email
6. Set a new password

## Common Issues

### Email Not Received
- Check spam/junk folder
- Verify email address is correct and verified in Firebase Console
- Ensure Email/Password authentication is enabled
- Check authorized domains are configured

### "Unauthorized domain" Error
- Add your domain to Authorized domains in Firebase Console
- Wait a few minutes for changes to propagate

### "Invalid API key" Error
- Double-check all Firebase credentials in .env file
- Ensure no extra spaces or quotes
- Restart the app after changes

## Security Notes

⚠️ **Important**: 
- Never commit the `.env` file with real Firebase credentials to public repositories
- Use Firebase Security Rules to protect your database
- Enable App Check for additional security in production
- Monitor Firebase usage in the Console

## Support

For more help:
- [Firebase Authentication Docs](https://firebase.google.com/docs/auth)
- [Firebase Email Link Setup](https://firebase.google.com/docs/auth/web/email-link-auth)
- [Expo Firebase Guide](https://docs.expo.dev/guides/using-firebase/)

---

**Current App State**: Demo Mode (Local Storage Only)  
**To Enable**: Follow steps above to add real Firebase credentials
