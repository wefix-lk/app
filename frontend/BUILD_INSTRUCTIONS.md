# WeFix Service - EAS Build Instructions

## 🎉 Everything is Prepared!

Your app is ready to be built with EAS. Follow these simple steps:

---

## 📋 Prerequisites

1. **Node.js** installed (check: `node --version`)
2. **Expo account** (free, create at expo.dev)
3. **EAS CLI** installed

---

## 🚀 Step-by-Step Build Process

### Step 1: Install EAS CLI (if not already installed)

```bash
npm install -g eas-cli
```

### Step 2: Login to Your Expo Account

```bash
eas login
```

*Enter your Expo username/email and password*

### Step 3: Navigate to Your Project

```bash
cd /app/frontend
```

### Step 4: Configure EAS Project (First Time Only)

```bash
eas build:configure
```

*This creates a project on Expo and links it to your account*

### Step 5: Build APK (For Testing/Distribution)

```bash
eas build --platform android --profile production-apk
```

**OR**

### Step 5: Build AAB (For Google Play Store)

```bash
eas build --platform android --profile production
```

**OR**

### Step 5: Build Both (Recommended)

Run them one after another:

```bash
# Build AAB first (for Play Store)
eas build --platform android --profile production

# Then build APK (for testing)
eas build --platform android --profile production-apk
```

---

## ⏱️ Build Process

1. **Upload**: EAS uploads your code (~1-2 minutes)
2. **Queue**: Your build enters the queue (instant to few minutes)
3. **Building**: EAS builds your app (~10-20 minutes)
4. **Download**: You get a download link

**Total Time**: Usually 15-25 minutes

---

## 📥 After Build Completes

### Option A: Download from CLI

The CLI will show a download link when complete:
```
✅ Build finished
📦 Android application: https://expo.dev/artifacts/[your-build-id]
```

### Option B: Download from Web

1. Go to https://expo.dev
2. Sign in
3. Go to your project
4. Click on "Builds"
5. Download your APK/AAB

---

## 📱 Testing Your APK

### On Physical Device:
1. Download APK to your phone
2. Enable "Install from Unknown Sources" in settings
3. Open the APK file
4. Install and test!

### Note:
Google Play Protect might warn you - this is normal for apps not from Play Store. Click "Install Anyway".

---

## 🏪 Submitting to Google Play Store

### What You Need:
- **AAB file** (not APK) - built with `production` profile
- Google Play Developer account ($25 one-time fee)
- App screenshots (at least 2)
- Feature graphic (1024×500px)
- Privacy policy URL
- App description and details

### Steps:

1. **Create App in Play Console**
   - Go to https://play.google.com/console
   - Create new app
   - Fill in app details

2. **Upload AAB**
   - Go to "Release" → "Production"
   - Create new release
   - Upload your AAB file

3. **Complete Store Listing**
   - App description
   - Screenshots
   - Graphics
   - Content rating

4. **Submit for Review**
   - Review takes 1-7 days
   - You'll get email notifications

---

## 🔧 Build Profiles Explained

### `production` (AAB)
- For Google Play Store
- Optimized and signed
- Cannot be installed directly

### `production-apk` (APK)
- For direct installation/testing
- Same code as production
- Can be shared and installed manually

### `preview` (APK)
- For quick testing
- Internal distribution
- Development mode disabled

---

## ❓ Troubleshooting

### "eas: command not found"
```bash
npm install -g eas-cli
```

### "Not logged in"
```bash
eas login
```

### "Build failed"
- Check the error message in the build logs
- Common issues:
  - Invalid package name
  - Missing dependencies
  - Configuration errors

### "Invalid credentials"
- EAS handles signing automatically
- First build will generate credentials
- Stored securely in EAS

---

## 📊 App Configuration Summary

- **App Name**: WeFix Service
- **Package**: com.wefix.service
- **Version**: 1.0.0
- **Version Code**: 1
- **Icon**: ✅ Configured
- **Permissions**: Camera, Storage, Internet
- **API**: https://wefixservers.xyz/api

---

## 🎯 Quick Reference

```bash
# Install EAS CLI
npm install -g eas-cli

# Login
eas login

# Configure (first time)
eas build:configure

# Build AAB for Play Store
eas build --platform android --profile production

# Build APK for testing
eas build --platform android --profile production-apk

# Check build status
eas build:list
```

---

## 📞 Need Help?

If you encounter any issues:
1. Check build logs in EAS dashboard
2. Search Expo forums: https://forums.expo.dev
3. Check EAS Build docs: https://docs.expo.dev/build/introduction/

---

## 🎉 You're All Set!

Everything is configured and ready. Just follow the steps above, and you'll have your app built in about 20 minutes!

Good luck! 🚀
