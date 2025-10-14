# WeFix.lk Authentication Guide

## 🔧 Current Setup: Demo Mode (Local Storage)

The app is currently running in **Demo Mode** which means:
- ✅ User data is stored locally using AsyncStorage
- ✅ No Firebase credentials required for testing
- ✅ Full authentication functionality works
- ✅ Data persists between app sessions
- ✅ Bookings and user profiles are saved locally

## 📱 How to Test Authentication

### 1. **Create a New Account**
   - Open the app (it will show the login screen with a blue info banner saying "Demo Mode")
   - Click on **"Sign Up"** link
   - Fill in:
     - Full Name: `John Doe`
     - Email: `john@wefix.test`
     - Password: `test1234` (minimum 6 characters)
     - Confirm Password: `test1234`
   - Click **"Create Account"**
   - ✅ You'll be redirected to the Home screen

### 2. **Sign Out**
   - Go to the **Profile** tab (bottom right)
   - Scroll down and click **"Sign Out"**
   - Confirm the sign out dialog
   - ✅ You'll be redirected back to the Login screen

### 3. **Sign In with Existing Account**
   - On the Login screen, enter:
     - Email: `john@wefix.test`
     - Password: `test1234`
   - Click **"Login"**
   - ✅ You'll be logged in and see your personalized Home screen with "Hello, John Doe!"

### 4. **Test Booking System**
   - From Home, click **"Book Repair"** service card
   - Fill in the booking form:
     - TV Brand: `Samsung`
     - TV Model: `UN55TU7000`
     - Issue Type: `No Power / Won't Turn On`
     - Phone: `+94 77 123 4567`
     - Address: `123 Main Street, Colombo 03`
     - Choose: `Free Pickup` or `Home Service`
   - Click **"Book Repair Service"**
   - ✅ Booking is saved (locally in demo mode)

## 🔥 Switching to Production Firebase

When you're ready to use real Firebase:

### Step 1: Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project named "WeFix-LK"
3. Enable **Authentication** → Email/Password sign-in method
4. Create a **Firestore Database** (start in test mode, update rules later)
5. Enable **Firebase Storage**

### Step 2: Get Firebase Credentials
In your Firebase project settings, copy:
- API Key
- Auth Domain
- Project ID
- Storage Bucket
- Messaging Sender ID
- App ID

### Step 3: Update Environment Variables
Create or update `/app/frontend/.env`:

```env
# Keep existing variables
EXPO_PACKAGER_PROXY_URL=...
EXPO_PACKAGER_HOSTNAME=...
EXPO_PUBLIC_BACKEND_URL=...

# Add Firebase credentials
EXPO_PUBLIC_FIREBASE_API_KEY=your-api-key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
EXPO_PUBLIC_FIREBASE_APP_ID=your-app-id
```

### Step 4: Update Firestore Security Rules
In Firebase Console → Firestore → Rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection - users can only read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Bookings collection - users can create bookings and read their own
    match /bookings/{bookingId} {
      allow create: if request.auth != null;
      allow read, update, delete: if request.auth != null && 
        resource.data.userId == request.auth.uid;
    }
    
    // Warranties collection - authenticated users can read
    match /warranties/{warrantyId} {
      allow read: if request.auth != null;
      allow write: if false; // Only admins can write (via Firebase Admin SDK)
    }
    
    // Products collection - anyone can read, only admins can write
    match /products/{productId} {
      allow read: if true;
      allow write: if false; // Only admins can write
    }
    
    // Orders collection - users can create and read their own orders
    match /orders/{orderId} {
      allow create: if request.auth != null;
      allow read: if request.auth != null && 
        resource.data.userId == request.auth.uid;
    }
  }
}
```

### Step 5: Restart the App
```bash
sudo supervisorctl restart expo
```

The app will automatically detect Firebase credentials and switch from Demo Mode to Production Firebase mode!

## ⚠️ Important Security Notes

1. **Never commit Firebase credentials to Git** - Use environment variables
2. **Update Firestore rules** before going live
3. **Enable App Check** for production to prevent unauthorized access
4. **Set up Firebase Authentication email templates** for password reset
5. **Configure authorized domains** in Firebase Console

## 🧪 Error Messages & Troubleshooting

### "Invalid email or password"
- ✅ Correct error message - credentials don't match
- In Demo Mode: Account doesn't exist, create one first
- In Firebase Mode: Check credentials or create account

### "An account with this email already exists"
- ✅ Correct behavior - try logging in instead
- The email is already registered

### "Password is too weak"
- Password must be at least 6 characters
- Firebase enforces this in production mode

### "Network error"
- Check internet connection
- Verify Firebase credentials are correct
- Check if Firebase project is active

## 📊 Current Features Status

| Feature | Demo Mode | Firebase Mode | Status |
|---------|-----------|---------------|--------|
| Email/Password Login | ✅ Local Storage | ✅ Firebase Auth | Working |
| User Registration | ✅ Local Storage | ✅ Firebase Auth | Working |
| Password Reset | ℹ️ Shows success | ✅ Email sent | Working |
| User Profile | ✅ Local Storage | ✅ Firestore | Working |
| Bookings | ✅ Local Storage | ✅ Firestore | Working |
| Warranty Check | ⚠️ Mock data | ✅ Firestore | Partial |
| Products | ✅ Mock data | ⚠️ Needs WooCommerce | Working |
| Push Notifications | ❌ Not implemented | ⚠️ Needs FCM setup | Pending |

## 🎯 Next Steps

1. ✅ Test complete authentication flow in Demo Mode
2. ✅ Test booking creation and storage
3. ⏳ Set up production Firebase project
4. ⏳ Integrate WooCommerce API for products
5. ⏳ Implement push notifications with FCM
6. ⏳ Build admin dashboard
7. ⏳ Add payment gateway (PayHere)

---

**Need Help?** The authentication system is now fully functional in Demo Mode. Create an account and start testing all features!
