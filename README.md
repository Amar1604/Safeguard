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

### Core Safety
- **Emergency SOS Button** — One-touch emergency alert trigger
- **Real-Time GPS Tracking** — Automatic location detection and sharing
- **Emergency Contact Notifications** — Instant SMS/Email alerts to predefined contacts
- **Live Alert Dashboard** — Real-time monitoring of active alerts
- **Location Mapping** — Visual representation of incident locations

### User Management
- **Secure Authentication** — Login and registration system
- **Device Integration** — Hardware device connectivity status
- **Emergency Contact Management** — Add and manage trusted contacts

### Alert Management
- **Alert History** — Full log of past emergency incidents
- **Status Monitoring** — Active, resolved, and pending alert states
- **Automatic Resolution** — Configurable auto-resolution timers

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | HTML5, CSS3, JavaScript (ES6+) |
| Styling | Custom CSS, Responsive Design |
| Location | Browser Geolocation API |
| Real-time | JavaScript Event-Driven Architecture |
| Storage | Browser LocalStorage |
| Notifications | SMS + Email (multi-channel) |

---

## 📁 Project Structure

```
women-safety/
├── index.js          # Main application logic and functions
├── login.html        # Main HTML interface
├── styles.css        # Application styling
└── README.md         # Project documentation
```

---

## 🚀 Getting Started

### Prerequisites
- Modern web browser with JavaScript enabled
- Internet connection for geolocation services
- Hardware safety device *(optional, for full functionality)*

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/women-safety.git
cd women-safety

# Open in browser
open login.html
# No build steps — fully client-side
```

### Usage

1. **Register / Login** — Create an account or log in
2. **Add Emergency Contacts** — Configure who receives alerts
3. **Activate SOS** — Press emergency button when in danger
4. **Monitor Alerts** — View live alerts on the dashboard

---

## 🔧 Configuration

### Emergency Contacts
- Add multiple emergency contacts
- Supports SMS and email notifications
- Stored securely in browser LocalStorage

### Alert Settings
- Auto-resolution timer *(default: 2 minutes)*
- Location accuracy preferences
- Notification channel preferences

---

## 📊 Architecture & Diagrams

---

### 1. 🏗️ System Architecture

```mermaid
graph TB
    subgraph DEVICE["📱 Client Device"]
        HW["🔴 Hardware SOS Button"]
        GEO["📍 Geolocation API"]
        UI["🖥️ Web Dashboard\n(login.html)"]
        JS["⚙️ App Logic\n(index.js)"]
        LS["💾 LocalStorage\n(contacts + history)"]
    end

    subgraph NOTIF["📣 Notification Layer"]
        SMS["📱 SMS Alert"]
        EMAIL["📧 Email Alert"]
        DASH["📊 Dashboard Alert"]
    end

    subgraph CONTACTS["👥 Emergency Contacts"]
        C1["Contact 1"]
        C2["Contact 2"]
        C3["Contact N..."]
    end

    HW -->|Trigger| JS
    UI -->|Manual SOS| JS
    GEO -->|GPS Coords| JS
    JS -->|Read/Write| LS
    JS --> SMS
    JS --> EMAIL
    JS --> DASH

    SMS --> C1
    EMAIL --> C2
    DASH --> C3

    style HW fill:#c0392b,color:#fff
    style JS fill:#8e44ad,color:#fff
    style GEO fill:#2980b9,color:#fff
    style UI fill:#2980b9,color:#fff
    style LS fill:#27ae60,color:#fff
    style SMS fill:#e67e22,color:#fff
    style EMAIL fill:#e67e22,color:#fff
    style DASH fill:#e67e22,color:#fff
```

---

### 2. 🔄 SOS Alert Flow (Sequence)

```mermaid
sequenceDiagram
    participant U as 👩 User
    participant HW as 🔴 SOS Button
    participant APP as ⚙️ App Logic
    participant GPS as 📍 GPS API
    participant LS as 💾 LocalStorage
    participant SMS as 📱 SMS
    participant EMAIL as 📧 Email
    participant DASH as 📊 Dashboard

    U->>HW: Press SOS / Manual trigger
    HW->>APP: Emergency event fired
    APP->>GPS: Request current coordinates
    GPS-->>APP: lat, lng, accuracy
    APP->>LS: Load emergency contacts
    LS-->>APP: Contact list
    APP->>SMS: Send SMS alert + location
    APP->>EMAIL: Send Email alert + location
    APP->>DASH: Push live alert to dashboard
    APP->>LS: Save incident to history
    DASH-->>U: Real-time alert visible

    Note over APP,DASH: Auto-resolution timer starts (default 2 min)

    alt Manual resolve
        U->>DASH: Mark as resolved
        DASH->>LS: Update alert status
    else Auto-resolve
        APP->>DASH: Status → Resolved (timeout)
    end
```

---

### 3. 👤 User Authentication Flow

```mermaid
flowchart TD
    START(["🚀 Open App"]) --> LOGIN["Login Page\n(login.html)"]
    LOGIN --> HAS{"Existing\nAccount?"}

    HAS -->|Yes| CRED["Enter Credentials"]
    HAS -->|No| REG["Register New Account"]

    REG --> SAVE["Save to LocalStorage"]
    SAVE --> CRED

    CRED --> AUTH{"Auth\nValid?"}
    AUTH -->|❌ No| ERR["Show Error"] --> CRED
    AUTH -->|✅ Yes| DASH["🏠 Main Dashboard"]

    DASH --> CONTACTS["Manage Emergency\nContacts"]
    DASH --> SOS["🔴 SOS Button"]
    DASH --> HISTORY["📋 Alert History"]
    DASH --> DEVICE["📡 Device Status"]

    style START fill:#27ae60,color:#fff
    style DASH fill:#2980b9,color:#fff
    style SOS fill:#c0392b,color:#fff
    style AUTH fill:#8e44ad,color:#fff
    style ERR fill:#e74c3c,color:#fff
```

---

### 4. 📍 Alert Lifecycle (State Machine)

```mermaid
stateDiagram-v2
    [*] --> IDLE : App loaded

    IDLE --> TRIGGERED : SOS pressed / Device signal
    TRIGGERED --> LOCATING : Fetch GPS coordinates
    LOCATING --> NOTIFYING : Coords acquired
    LOCATING --> NOTIFYING : Timeout — use last known location

    NOTIFYING --> ACTIVE : All contacts notified
    ACTIVE --> RESOLVED : User resolves manually
    ACTIVE --> RESOLVED : Auto-timer expires (2 min)
    ACTIVE --> ESCALATED : No response detected

    ESCALATED --> RESOLVED : Authorities notified + resolved
    RESOLVED --> LOGGED : Saved to alert history

    LOGGED --> IDLE : Ready for next event
```

---

### 5. 🗂️ Data Flow & Storage

```mermaid
graph LR
    subgraph INPUT["📥 Input Sources"]
        HW["🔴 Hardware Button"]
        WEB["🖱️ Web UI Trigger"]
        GPS["📍 GPS Signal"]
    end

    subgraph PROCESS["⚙️ index.js Processing"]
        EVT["Event Handler"]
        LOC["Location Resolver"]
        ALT["Alert Builder"]
        NOT["Notification Dispatcher"]
    end

    subgraph STORAGE["💾 LocalStorage"]
        USR["users{}"]
        CON["contacts[]"]
        HIST["alert_history[]"]
        SET["settings{}"]
    end

    subgraph OUTPUT["📤 Outputs"]
        SMS2["SMS"]
        MAIL["Email"]
        UI2["Dashboard UI"]
    end

    HW --> EVT
    WEB --> EVT
    GPS --> LOC
    EVT --> LOC --> ALT --> NOT
    ALT --> HIST
    NOT --> SMS2
    NOT --> MAIL
    NOT --> UI2

    USR --> EVT
    CON --> NOT
    SET --> ALT

    style EVT fill:#8e44ad,color:#fff
    style LOC fill:#2980b9,color:#fff
    style ALT fill:#e67e22,color:#fff
    style NOT fill:#c0392b,color:#fff
```

---

### 6. 📱 Component Structure

```mermaid
graph TD
    APP["🛡️ SafeGuard App"]

    APP --> AUTH["🔐 Auth Module\n(login/register)"]
    APP --> CORE["🔴 SOS Core\n(trigger + GPS)"]
    APP --> DASH2["📊 Dashboard\n(live alerts)"]
    APP --> CONT["👥 Contact Manager\n(add/remove)"]
    APP --> HIST2["📋 History Viewer\n(past incidents)"]
    APP --> DEV["📡 Device Monitor\n(HW status)"]

    AUTH --> LS1["LocalStorage\nusers"]
    CORE --> LS2["LocalStorage\nalert_history"]
    CONT --> LS3["LocalStorage\ncontacts"]
    DASH2 --> CORE
    DASH2 --> HIST2

    style APP fill:#c0392b,color:#fff
    style CORE fill:#8e44ad,color:#fff
    style AUTH fill:#2980b9,color:#fff
    style DASH2 fill:#27ae60,color:#fff
    style CONT fill:#e67e22,color:#fff
    style HIST2 fill:#7f8c8d,color:#fff
    style DEV fill:#7f8c8d,color:#fff
```

---

## 📱 How It Works

1. **Detection** — Hardware device or manual UI trigger fires the SOS event
2. **Location** — GPS coordinates captured automatically via Geolocation API
3. **Notification** — Emergency contacts receive instant SMS + email with location
4. **Tracking** — Location pinned on the live dashboard in real time
5. **Response** — Alert resolved manually or auto-expires after 2 minutes
6. **Logging** — Full incident saved to history for future reference

---

## 🔒 Privacy & Security

- Location data processed **locally** wherever possible
- Emergency contacts stored in **encrypted browser storage**
- **No personal data** transmitted without explicit user consent
- All outbound communications are **encrypted in transit**
- Zero third-party analytics or tracking

---

## 🤝 Contributing

Contributions to improve women's safety technology are welcome!

```bash
# Fork → branch → commit → push → PR
git checkout -b feature/YourFeature
git commit -m 'Add YourFeature'
git push origin feature/YourFeature
# Open a Pull Request
```

**Guidelines:**
- Do not reduce alert sensitivity or response speed
- Test all SOS flows before submitting PR
- Include screenshots or screen recordings as proof
- Keep location accuracy logic intact

---

## 🙋‍♀️ Support

- Open an issue on GitHub
- Contact the development team
- Check documentation for common solutions

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

---

<div align="center">

**SafeGuard** — Empowering women with technology for safety and peace of mind. 🛡️✨

</div>
