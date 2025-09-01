# Firebase Setup for Location Sharing

## Steps to Enable Location Sharing:

### 1. Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project"
3. Enter project name (e.g., "women-safety-tracker")
4. Disable Google Analytics (optional)

### 2. Setup Realtime Database
1. In Firebase console, go to "Realtime Database"
2. Click "Create Database"
3. Choose "Start in test mode" for now
4. Select your preferred location

### 3. Get Configuration
1. Go to Project Settings (gear icon)
2. Scroll to "Your apps" section
3. Click "Web" icon to add web app
4. Register app with a name
5. Copy the config object

### 4. Update Maps.html
Replace the firebaseConfig in Maps.html with your actual config:

```javascript
const firebaseConfig = {
    apiKey: "your-actual-api-key",
    authDomain: "your-project.firebaseapp.com",
    databaseURL: "https://your-project-default-rtdb.firebaseio.com/",
    projectId: "your-project-id"
};
```

### 5. Security Rules (Optional)
For production, update database rules in Firebase console:

```json
{
  "rules": {
    "locations": {
      ".read": true,
      ".write": true,
      "$userId": {
        ".validate": "newData.hasChildren(['lat', 'lng', 'timestamp'])"
      }
    }
  }
}
```

## How It Works:
- Each device gets a unique user ID
- Your location updates every 5 seconds in Firebase
- Other devices see your marker on their map
- Blue circle shows your location, regular markers show others
- Click markers to see user info and last update time

## Alternative: Local Network Solution
If you prefer not to use Firebase, I can create a simple local server solution using Node.js that works on your local network only.