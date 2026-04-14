# CareCheck 🏥
**Hospital Transparency Platform for India**

A community-driven web platform designed to bring transparency to the Indian healthcare ecosystem by allowing patients to locate hospitals, review wait times, evaluate billing transparency, and share their overall experiences.

---

## 🌟 Key Features

### For Patients
- **Geographic Mapping**: Seamlessly search and locate hospitals on an interactive map.
- **Detailed Hospital Profiles**: View government accreditations (NABH, Ayushman Bharat), associated insurance providers, and 24/7 departments.
- **Multidimensional Reviews**: Submit structured ratings across detailed metrics (Cleanliness, Staff Behavior, Emergency Responsiveness, etc).
- **Media Uploads**: Attach optional proof (images/PDFs) to reviews to validate administrative and billing experiences.

### For Administrators & Hospital Reps
- **Moderation Workflow**: Process incoming patient feedback via a dedicated pending queue before it goes live.
- **Metrics Dashboard**: Monitor aggregate platform metrics, overall average ratings, and total listed hospitals.
- **Data Export**: One-click functionality to export platform metrics into CSV format for offline reporting and analysis.
- **Asset Management**: Maintain and manage lists of hospital departments and accepted insurance formats.

---

## 🛠️ Tech Stack

- **Backend Architecture:** Python, Flask, Flask-SQLAlchemy, Flask-CORS
- **Database:** SQLite (local `carecheck_v2.db`)
- **Frontend Core:** Vanilla HTML5, CSS3 (Glassmorphism & Custom Themes), JavaScript (ES6+)
- **Geospatial & Mapping:** Leaflet.js rendering OpenStreetMap data via the Nominatim API.

---

## 📁 Project Structure

```text
care-checker/
│
├── backend/
│   ├── app.py             # Main Flask application, API routing, and Backend logic
│   ├── models.py          # SQLAlchemy Relational Database Models
│   ├── requirements.txt   # Python dependency list
│   └── carecheck_v2.db    # Persistent SQLite database (auto-seeded on first run)
│
├── frontend/
│   ├── index.html         # Main Single Page Application (SPA) entry point
│   ├── css/
│   │   └── style.css      # Core styling and design tokens
│   ├── js/
│   │   └── app.js         # Frontend interface logic, API consumption, Map Initialization
│   └── uploads/           # Local storage directory for patient review attachments
│
└── README.md              # Project Documentation
```

---

## 🚀 Setup & Installation

Follow these steps to run the comprehensive application stack locally on your machine.

### Prerequisites
- Python 3.8+ installed on your operating system.

### 1. Set Up the Backend Environment
Navigate to the backend directory and set up a Python virtual environment to keep dependencies isolated.

```bash
cd backend
python -m venv venv

# Activate the virtual environment
# Windows PowerShell:
.\venv\Scripts\activate
# Windows Command Prompt:
.\venv\Scripts\activate.bat
# Mac/Linux:
source venv/bin/activate

# Install required dependencies
pip install -r requirements.txt
```

### 2. Run the Application
The Flask application is specially configured to serve both the REST API and the frontend static assets. You only need to run one command!

```bash
# While in the backend directory with your venv activated:
python app.py
```

### 3. Open the Dashboard
Visit `http://127.0.0.1:5000` in your preferred web browser to begin using the application.

---

## 🔐 Default Credentials

The platform auto-seeds initial data context on its first run. You can log into the Admin portal via the interface using the predefined administrator account:

- **Email Dropdown / Input Phase:** `admin@carecheck.in`
- **Password:** `admin123` *(Check backend seeder method for exact values if they shift)*

Patient level credentials are also seeded for rapid testing, and the app allows for standard registration flows.

---

## 🛠 Future Roadmap (Phase 4 & Beyond)
- Integration with live Indian Government Healthcare APIs to automatically ping accreditation endpoints.
- OTP SMS verification pathways to further validate authentic patient feedback.
- Administrative graphical data modules mapping geographic rating differentials.
