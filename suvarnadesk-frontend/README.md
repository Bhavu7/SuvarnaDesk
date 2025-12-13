# SuvarnaDesk – Jewelry Shop Management System

SuvarnaDesk is a **full-stack jewelry shop management system** designed to digitize and streamline day-to-day retail operations. It provides a modern React-based frontend backed by a secure, scalable Node.js + Express + TypeScript + MongoDB API.

The system covers the full business lifecycle — customers, products, invoices, metal rates, repair receipts, shop settings, and printable PDF documents with QR codes — built with long-term maintainability and real-world shop workflows in mind.

---

## Table of Contents

- Overview  
- Features  
- Tech Stack  
- Project Structure  
- Backend Setup  
- Frontend Setup  
- Core Modules  
- Running the Full Stack  
- Build & Deployment  
- Contributing  
- License  

---

## Overview

SuvarnaDesk acts as the **single source of truth** for a jewelry shop’s operational data. It emphasizes:

- Accuracy in billing and metal-rate calculations  
- Clear customer and repair job traceability  
- Role-based admin access for sensitive operations  
- Print-ready invoices and repair receipts  

Traditional business logic, implemented with modern tooling.

---

## Features

- **Admin Authentication & Access Control**
  - Secure login, protected routes, admin limits  
- **Customer Management**
  - CRUD, search, and history of invoices and repairs  
- **Product Catalog**
  - Jewelry items, pricing, and metadata for billing  
- **Invoicing**
  - Invoice creation, calculations, PDF & QR generation  
- **Repair Receipts**
  - Track jewelry repair jobs from intake to delivery  
- **Metal Rates**
  - Daily gold/silver rate configuration used across billing  
- **Shop Settings**
  - Shop profile, invoice/receipt formats, terms, numbering  
- **PDF & QR Utilities**
  - Professionally formatted documents with scannable QR codes  

---

## Tech Stack

| Layer      | Technology |
|-----------|------------|
| Frontend  | React (SPA), JavaScript / TypeScript |
| Backend   | Node.js, Express, TypeScript |
| Database  | MongoDB with Mongoose |
| Auth      | Custom JWT auth, password hashing, admin limits |
| Utilities | PDF generation, QR codes, typed environment variables |

---

## Project Structure

backend/
└─ src/
├─ index.ts
├─ routes/
├─ controllers/
├─ models/
├─ middleware/
├─ utils/
└─ types/

frontend/
└─ src/
├─ components
├─ pages
├─ hooks
├─ services
└─ routing

yaml
Always show details

Copy code

---

## Backend Setup

### Environment Variables

Create a `.env` file inside `backend/`:

MONGO_URI=your-mongodb-connection-string
PORT=4000
JWT_SECRET=your-jwt-secret

yaml
Always show details

Copy code

---

### Install & Run (Backend)

cd backend
npm install

Development
npm run dev

Production
npm run build
npm start

yaml
Always show details

Copy code

Healthcheck endpoint:

GET /

yaml
Always show details

Copy code

---

## Frontend Setup

The frontend communicates with the backend REST API.

### Environment Variables (Frontend)

For **Vite**:
VITE_API_BASE_URL=http://localhost:4000

markdown
Always show details

Copy code

For **Create React App**:
REACT_APP_API_BASE_URL=http://localhost:4000

yaml
Always show details

Copy code

---

### Install & Run (Frontend)

cd frontend
npm install

Development
npm run dev # or npm start

Production
npm run build

yaml
Always show details

Copy code

---

## Core Modules

### Admin & Authentication
- JWT-based authentication
- Admin role limits and access control
- Secure password hashing

### Customers & Products
- Customer CRUD with invoice/repair associations
- Product catalog used across invoices and repairs

### Invoices & Repair Receipts
- Invoice lifecycle with PDF + QR support
- Repair receipt workflow with status tracking

### Metal Rates & Shop Settings
- Daily metal rate configuration
- Shop profile, numbering, and document formatting

---

## Running the Full Stack

1. Start backend:
cd backend
npm run dev

markdown
Always show details

Copy code

2. Start frontend:
cd frontend
npm run dev

yaml
Always show details

Copy code

3. Open the frontend (default: `http://localhost:3000`) and log in as admin.

---

## Build & Deployment

- Backend: Deploy to any Node.js-compatible hosting (VPS, Render, Railway)
- Frontend: Deploy build output to Netlify, Vercel, or similar
- Configure environment variables in production accordingly

---

## Contributing

1. Fork the repository  
2. Create a feature branch  
3. Commit with clear messages  
4. Open a pull request with details  

---

## Developed and maintained by Bhavesh Bhoi.

Full-stack developer specializing in scalable web applications and clean system architecture.

---

## License

This project is licensed under the MIT License.
"""

license_text = """MIT License

Copyright (c) 2025 SuvarnaDesk

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.