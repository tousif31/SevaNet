# 🏙️ SevaNet – Smart Civic Issue Reporting Platform

**SevaNet** is a smart civic engagement platform that empowers citizens to report local issues—like potholes, broken street lights, and waste—directly to city authorities. It fosters faster resolution, transparency, and collaborative urban governance.

---

## 📌 Problem Statement

Current civic issue reporting systems are often fragmented, slow, and opaque. Citizens lack an effective way to report problems, and authorities face delays in addressing them.  
**Pura Connect** solves this by offering a unified, real-time digital platform to bridge this communication gap.

---

## 🎯 Purpose

- Empower citizens to voice local issues using digital tools.
- Strengthen communication between communities and local governments.
- Enhance transparency and accountability in public services.
- Contribute to smart, inclusive, and sustainable urban development.

---

## 🧠 System Overview

### 👥 User Roles
- **Citizens**: Report issues with photos, descriptions, and location.
- **Admins**: Monitor and update complaint statuses in real time.
- **Authorities**: Analyze data for improved civic response and planning.

### 🔧 Core Modules
- Complaint Submission
- Status Tracking Dashboard
- Map Integration (Geo-location tagging)
- Waste Categorization (Dry/Wet)
- Notifications & Alerts

---

## ⚙️ Project Setup

This project uses a **React (frontend)**, **Express (backend)**, and **PostgreSQL (database)** stack.

### 📁 Folder Structure



---

### 🧱 Requirements

- Node.js (v18+)
- PostgreSQL (v13+)
- npm or yarn
- Git

---

### 🚀 1. Clone the Repository

```bash
git clone https://github.com/yourusername/pura-connect.git](https://github.com/tousif31/Pura-connect.git
cd pura-connect

cd server
npm install


PORT=5000
DATABASE_URL=postgresql://your_user:your_password@localhost:5432/pura_connect


npx prisma migrate dev


npm run dev


cd ../client
npm install


REACT_APP_API_URL=http://localhost:5000


npm start


-- Run this in your psql shell or GUI (e.g., pgAdmin)
CREATE DATABASE pura_connect;


