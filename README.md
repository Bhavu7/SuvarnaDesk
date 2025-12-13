# SuvarnaDesk - Jewelry Shop Management System

Complete full-stack application for jewelry businesses to manage customers, products, invoices, repair receipts, metal rates, shop settings, and generate professional PDFs with QR codes.

## ✨ Features

- **Admin Authentication** - Secure login with role-based access control and admin limits
- **Customer Management** - CRUD operations, search, and transaction history
- **Product Catalog** - Jewelry inventory with pricing and categories
- **Invoicing System** - Create, edit, list invoices with metal rate calculations
- **Repair Receipts** - Track repair jobs from receipt to delivery
- **Metal Rates** - Daily gold/silver price configuration
- **Shop Settings** - Customize shop profile, invoice templates, numbering
- **PDF Generation** - Professional invoice and receipt PDFs with QR codes
- **Responsive UI** - Modern React interface for desktop and mobile

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React, TypeScript/JavaScript, Vite/Create React App |
| **Backend** | Node.js, Express, TypeScript |
| **Database** | MongoDB (Mongoose ODM) |
| **Auth** | Custom JWT middleware, password hashing |
| **PDF** | Custom PDF generator with QR codes |
| **Dev Tools** | npm/yarn, TypeScript, CORS enabled |

## 📁 Project Structure

```
suvarnadesk/
├── backend/
│   ├── src/
│   │   ├── index.ts
│   │   ├── routes/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── middleware/
│   │   └── utils/
│   └── package.json
└── frontend/
    ├── src/
    ├── package.json
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB
- npm or yarn

### Backend

```
cd backend
npm install
npm run dev
```

### Frontend

```
cd frontend
npm install
npm run dev
```

## 🔧 Environment Variables

### Backend
```
MONGO_URI=mongodb://localhost:27017/suvarnadesk
PORT=4000
JWT_SECRET=your-jwt-secret
```

### Frontend
```
VITE_API_BASE_URL=http://localhost:4000
```

## 📄 License

MIT License. See LICENSE file for details.

## Developed and maintained by Bhavesh Bhoi.

Full-stack developer specializing in scalable web applications and clean system architecture.