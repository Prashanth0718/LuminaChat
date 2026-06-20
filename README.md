# 💬 Real-Time Chat Application

A full-stack real-time messaging platform built using **React, FastAPI, MongoDB, and WebSockets**. The application supports private messaging, group conversations, media sharing, voice notes, real-time status updates, and modern chat features similar to WhatsApp and Telegram.

---

## 🚀 Features

### 🔐 Authentication & Security

* User Registration
* User Login
* JWT Authentication
* Protected Routes
* Forgot Password
* Session Expiry Detection
* Automatic Logout on Token Expiration

### 👤 User Profiles

* Profile Management
* Profile Picture Support
* View User Information
* Update Personal Details

### 💬 Messaging

* One-to-One Chat
* Group Chat
* Real-Time Messaging using WebSockets
* Message Search
* Reply to Messages
* Edit Messages
* Delete Messages
* Copy Messages
* Message Reactions
* Pin / Unpin Messages
* Forward Messages

### 👥 Group Management

* Create Groups
* Add Members
* Remove Members
* Group Information Modal
* Real-Time Group Updates

### 📩 Message Status

* Sent Status ✓
* Delivered Status ✓✓
* Read Receipts ✓✓
* Unread Message Counts
* Typing Indicator
* Online / Offline Status
* Last Seen Tracking

### 📁 Media & File Sharing

* Image Uploads
* Image Preview
* File Sharing (PDF, Documents, etc.)
* Voice Messages
* Media Forwarding
* File Forwarding
* Voice Note Forwarding

### 🎨 User Experience

* Dark Mode
* Responsive Layout
* Sidebar Search
* Chats / Groups Tabs
* Modern UI with Tailwind CSS
* Smooth User Interactions

---

## 🛠️ Tech Stack

### Frontend

* React.js
* Vite
* Tailwind CSS
* Axios
* Framer Motion
* React Router DOM

### Backend

* FastAPI
* Python
* WebSockets
* JWT Authentication

### Database

* MongoDB Atlas

### Storage

* Local File Storage for Media Uploads

---

## 📂 Project Structure

```bash
chat-app/
│
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   └── App.jsx
│
├── backend/
│   ├── routes/
│   ├── models/
│   ├── database/
│   ├── uploads/
│   └── main.py
│
└── README.md
```

## ⚡ Installation

### Clone Repository

```bash
git clone <repository-url>
cd chat-app
```

### Backend Setup

```bash
cd backend

pip install -r requirements.txt

uvicorn main:app --reload
```

### Frontend Setup

```bash
cd frontend

npm install

npm run dev
```

---

## 🌐 Environment Variables

### Backend (.env)

```env
MONGO_URI=your_mongodb_connection_string

SECRET_KEY=your_secret_key

ALGORITHM=HS256
```

---

## 📸 Key Features Demonstrated

* Real-Time Communication
* WebSocket Integration
* JWT-Based Authentication
* MongoDB CRUD Operations
* State Management in React
* Media Upload Handling
* Group Collaboration Features
* Modern Responsive UI

---

## 🎯 Future Enhancements

* Push Notifications
* Video Calling
* Audio Calling
* Message Encryption
* Cloud Media Storage
* Multi-Device Sync
* Chat Backup & Restore

---

## 👨‍💻 Author

Prashanth S N

Associate Software Engineer | CGI

Built as a full-stack learning and portfolio project to explore modern real-time communication systems.
