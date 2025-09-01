# Firebase Database Rules Fix

## Current Issue:
Emergency contacts can't be added due to PERMISSION_DENIED error.

## Solution 1: Update Firebase Rules (Recommended)

Go to Firebase Console → Realtime Database → Rules and replace with:

```json
{
  "rules": {
    "locations": {
      ".read": true,
      ".write": true
    },
    "alerts": {
      ".read": true,
      ".write": true
    },
    "emergencyContacts": {
      ".read": true,
      ".write": true
    }
  }
}
```

## Solution 2: Already Implemented - localStorage Fallback

The app now automatically falls back to localStorage when Firebase permissions fail:

- **Contacts saved locally** in browser storage
- **Works offline** - no internet required
- **Same functionality** - add, delete, call contacts
- **Automatic fallback** - tries Firebase first, then localStorage

## How It Works Now:

1. **Try Firebase** - Attempts to save to cloud database
2. **If permission denied** - Automatically saves to localStorage
3. **User notification** - Shows "(saved locally)" message
4. **Full functionality** - All features work the same

## To Fix Permanently:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: "women-safety-tracker-2da51"
3. Go to "Realtime Database" → "Rules"
4. Replace rules with the JSON above
5. Click "Publish"

## Current Status:
✅ **Emergency contacts work** - Using localStorage fallback
✅ **Location sharing works** - Firebase permissions OK
✅ **Alerts work** - Firebase permissions OK
❌ **Contact cloud sync** - Needs Firebase rules update