# SafeGuard — Women Safety Alert System

<div align="center">

🛡️ **Empowering women with technology for safety and peace of mind.**

![Status](https://img.shields.io/badge/Status-Active-brightgreen?style=for-the-badge&labelColor=1a1a1a)
![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge&labelColor=1a1a1a)
![Platform](https://img.shields.io/badge/Platform-Web-purple?style=for-the-badge&labelColor=1a1a1a)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-yellow?style=for-the-badge&labelColor=1a1a1a)

</div>

---

**SafeGuard** is a comprehensive women safety application providing immediate emergency response and real-time location tracking. It combines hardware device integration with a web-based dashboard for live monitoring and alert management.

---

## 🚨 Features

### Core Safety & Live Tracking
- **Emergency SOS Button** — One-touch emergency alert trigger.
- **Real-Time GPS Tracking** — Automatic location detection and sharing.
- **Location Mapping** — Visual representation of incident locations with pulsing markers.
- **Coordinate Breadcrumbs Trail** — Traces and draws a dashed polyline of the victim's route history on the map while an SOS is active.
- **Synthesized Web Audio Siren** — Generates a warning alarm tone completely client-side using the HTML5 Web Audio API (no external audio assets required).

### IoT Hardware Device Simulation
- **Visual Telemetry Controls** — Side dashboard panel allowing users to test wearable device inputs without real hardware:
  - ESP32 hardware connection status toggling.
  - Custom battery status slider (with automated low battery alerts).
  - Walk/Run GPS movement simulator (auto-updates coordinates on map).
  - Physical SOS button trigger simulation.

### User & Contacts Management
- **Secure Authentication** — Unified Firebase Auth login and registration system.
- **Device Integration** — Hardware device connectivity status indicators.
- **Emergency Contact Panel** — Cloud syncing of contacts via Firebase Realtime Database with secure browser-based `localStorage` fallback for offline resiliency.

### Alert Management & Admin Controls
- **Responder Map Portal (Maps.html)** — A full-screen administrative tracking map designed for dispatch centers with administrative sound notification warnings.
- **Manual Alert Resolution** — Admins/Responders can mark an active alert as resolved directly from the Leaflet marker details popup, syncing safety updates back to Firebase.
- **Auto-Resolution** — Configurable alert timeout (default 2 minutes) if no response is detected.

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | HTML5, CSS3, JavaScript (ES6+) |
| Styling | Custom CSS, Dark Glassmorphism, Responsive Grid |
| Location | Browser Geolocation API, Leaflet.js Mapping |
| Database | Firebase Realtime Database (Location & Alert syncing) |
| Auth | Firebase Authentication |
| Sound | HTML5 Web Audio API Synthesizer |
| Storage | Browser LocalStorage (fallback & configurations) |

---

## 📁 Project Structure

```
SafeGuard-main/
├── index.html        # Main dashboard interface
├── index.js          # Main application logic & Leaflet setup
├── styles.css        # Glassmorphic dark-theme styles
├── login.html        # Standalone login fallback page
├── register.html     # Signup page with database registry hooks
├── Maps.html         # Responder tracking portal
├── config.js         # Firebase credentials loader
├── FIREBASE_RULES.md # Database rules setup reference
├── FIREBASE_SETUP.md # Web project configuration reference
└── README.md         # Unified project documentation
```

---

## 🚀 Getting Started (Local Run)

### 1. Prerequisites
- Modern web browser with JavaScript enabled.
- A local HTTP server is required to serve the files over HTTP and bypass browser module/storage restrictions.

### 2. Start a Local Server
Run one of the following commands in the project directory:

**Using Python:**
```bash
python -m http.server 8000
```

**Using Node.js (http-server):**
```bash
npx http-server -p 8000
```

### 3. Open the Portals
Open your browser and navigate to:
- **Dashboard & Simulator**: [http://localhost:8000/index.html](http://localhost:8000/index.html)
- **Admin Tracker**: [http://localhost:8000/Maps.html](http://localhost:8000/Maps.html)

---

## 🔧 Firebase Configuration Setup

SafeGuard is configured to work out-of-the-box using fallback demo credentials, but for production or standalone deployments, follow these steps to connect your own database:

1. Create a project at the [Firebase Console](https://console.firebase.google.com/).
2. Add a Web App to your project and copy the configuration keys.
3. In the SafeGuard Dashboard, click **Configure Firebase Cloud** inside the **Device Settings** card.
4. Input your project credentials (API Key, Project ID, Database URL) and click **Save & Refresh**.
5. Enable **Email/Password Provider** inside Firebase Auth.
6. Enable **Realtime Database** and set the security rules to allow read/write access (refer to [FIREBASE_RULES.md](file:///d:/SafeGuard-main/FIREBASE_RULES.md)).

---

## 📊 Architecture & Diagrams

### 1. 🏗️ System Architecture

```mermaid
graph TB
    subgraph DEVICE["📱 Client Device"]
        HW["🔴 Hardware SOS Button / Simulator"]
        GEO["📍 Geolocation API"]
        UI["🖥️ Web Dashboard\n(index.html)"]
        JS["⚙️ App Logic\n(index.js)"]
        LS["💾 LocalStorage\n(contacts fallback)"]
    end

    subgraph CLOUD["☁️ Firebase Cloud Layer"]
        AUTH["🔐 Firebase Auth"]
        DB["🗄️ Realtime Database"]
    end

    subgraph ADMIN["📡 Dispatcher Portal"]
        MAP["🗺️ Maps.html Tracker"]
    end

    subgraph CONTACTS["👥 Emergency Contacts"]
        C1["Contact 1 (Phone/Email)"]
        C2["Contact 2 (Phone/Email)"]
    end

    HW -->|Trigger| JS
    UI -->|Manual SOS| JS
    GEO -->|GPS Coords| JS
    JS -->|Sync Profile| AUTH
    JS -->|Sync Location & Alerts| DB
    JS -->|Read/Write Fallback| LS
    DB -->|Push Alert updates| MAP
    JS -->|Alert Link| C1
    JS -->|Alert Link| C2

    style HW fill:#c0392b,color:#fff
    style JS fill:#8e44ad,color:#fff
    style GEO fill:#2980b9,color:#fff
    style UI fill:#2980b9,color:#fff
    style DB fill:#e67e22,color:#fff
    style MAP fill:#27ae60,color:#fff
```

---

### 2. 🔄 SOS Alert Flow (Sequence)

```mermaid
sequenceDiagram
    participant U as 👩 User / Simulator
    participant APP as ⚙️ index.js
    participant GPS as 📍 Geolocation API
    participant DB as ☁️ Firebase Database
    participant MAP as 📡 Maps.html (Admin)
    participant C as 👥 Contacts

    U->>APP: Press SOS Button (UI or HW Simulator)
    APP->>GPS: Request coordinates
    GPS-->>APP: lat, lng, accuracy
    APP->>DB: Push Alert (ACTIVE) & Locations node
    DB->>MAP: Trigger Alert Added (Plays buzzer + pans map)
    APP->>C: Open phone Quick-dial link
    
    loop Real-Time Location Loop
        GPS-->>APP: Updated lat, lng
        APP->>DB: Set Locations node
        DB->>MAP: Render moving marker + polyline trail
    end

    alt Manual resolve by User
        U->>APP: Click Stop sharing
        APP->>DB: Update node status to RESOLVED
        DB->>MAP: Marker turns gray (lastKnown), resolves
    else Manual resolve by Admin
        MAP->>DB: Click Resolve button in popup
        DB->>APP: Status changes to RESOLVED, stops audio
    end
```

---

### 3. 👤 User Authentication Flow

```mermaid
flowchart TD
    START(["🚀 Open App"]) --> AUTH_CHECK{"Authenticated?"}
    AUTH_CHECK -->|❌ No| LOGIN["Show Login Modal / login.html"]
    AUTH_CHECK -->|✅ Yes| DASH["🏠 Open Main Dashboard"]
    
    LOGIN --> HAS_ACCOUNT{"Have Account?"}
    HAS_ACCOUNT -->|Yes| CRED["Enter Credentials"]
    HAS_ACCOUNT -->|No| REG["Register (register.html)"]
    
    REG -->|Save Profile| DB["Realtime DB Users node"]
    DB --> CRED
    CRED -->|Firebase SignIn| AUTH_CHECK
    
    DASH --> SIM["🛠️ Run Hardware Simulator"]
    DASH --> SOS["🔴 Trigger SOS Alert"]
    DASH --> SETTINGS["⚙️ Manage Firebase keys"]
```

---

### 4. 📍 Alert Lifecycle (State Machine)

```mermaid
stateDiagram-v2
    [*] --> IDLE : App loaded
    IDLE --> TRIGGERED : SOS pressed / HW signal
    TRIGGERED --> LOCATING : Fetch Geolocation
    LOCATING --> NOTIFYING : Coordinates acquired
    NOTIFYING --> ACTIVE : Admin & contacts alert dispatched
    ACTIVE --> RESOLVED : User stops sharing / Admin resolves
    ACTIVE --> RESOLVED : Auto-resolution timeout (2 min)
    RESOLVED --> IDLE : Clean up database nodes
```

---

## 🔒 Privacy & Security

- Location data is processed **locally** and synced to Firebase only when an active SOS alert is running.
- Custom configurations and database project keys are stored securely inside the client's **browser local storage**.
- All database communication is encrypted in transit by Firebase SSL.

---

## 🤝 Contributing

Contributions to improve women's safety technology are welcome!
1. Fork the project.
2. Create your feature branch (`git checkout -b feature/AmazingFeature`).
3. Commit your changes (`git commit -m 'Add AmazingFeature'`).
4. Push to the branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.
