# SuvarnaDesk Backend

SuvarnaDesk Backend is a robust, scalable RESTful API designed for jewelry shop management. Built with Node.js, Express, TypeScript, and MongoDB, it handles core business workflows including customers, products, invoices, metal rates, repair receipts, shop configuration, PDF generation, and secure admin access control.

This backend is engineered for real-world retail operations—accurate billing, traceable repairs, and configurable shop workflows—because boring reliability beats flashy fragility every time.

## Table of Contents

- [SuvarnaDesk Backend](#suvarnadesk-backend)
  - [Table of Contents](#table-of-contents)
  - [Overview](#overview)
  - [Features](#features)
  - [Tech Stack](#tech-stack)
  - [Project Structure](#project-structure)
  - [Getting Started](#getting-started)
    - [Prerequisites](#prerequisites)
    - [Installation](#installation)
- [or](#or)

## Overview

SuvarnaDesk Backend serves as the core business engine for a jewelry shop management system. It centralizes operational data, enforces access rules, and provides extensible APIs for frontend or third-party integrations.

**Primary goals:**

- Accuracy in billing and metal rate usage
- Clear customer and repair tracking
- Secure, role-based admin access
- Printable, compliant invoices and receipts

Classic business logic. Modern execution.

## Features

- **Admin Authentication & Authorization**
  - Secure login, role management, and admin limits
- **Customer Management**
  - CRUD operations, search, and related invoice/repair lookups
- **Product Catalog**
  - Jewelry items, categories, pricing, and metadata
- **Invoice Management**
  - Create, update, list invoices with PDF and QR code generation
- **Repair Receipt Workflow**
  - Track jewelry repairs from intake to delivery
- **Metal Rate Master**
  - Daily metal rates used consistently across billing logic
- **Shop Settings**
  - Shop profile, invoice numbering, templates, and terms
- **PDF Generation**
  - Structured, printable invoices and repair receipts
- **Healthcheck Endpoint**
  - Quick API availability verification

## Tech Stack

- **Runtime:** Node.js
- **Language:** TypeScript
- **Framework:** Express.js
- **Database:** MongoDB (Mongoose ODM)
- **Authentication:** Custom JWT-based auth middleware
- **Security:** Password hashing, admin access limits
- **Utilities:** PDF generator, QR code helper

Stable tools. Proven choices. No experiments in production.

## Project Structure
src/
│
├── index.ts                 # App entry point, DB connection, route mounting
│
├── routes/
│   ├── adminRoutes.ts
│   ├── customerRoutes.ts
│   ├── productRoutes.ts
│   ├── invoiceRoutes.ts
│   ├── repairReceiptRoutes.ts
│   ├── metalRateRoutes.ts
│   ├── settingsRoutes.ts
│   └── pdfRoutes.ts
│
├── controllers/
│   ├── adminController.ts
│   ├── customerController.ts
│   ├── productController.ts
│   ├── invoiceController.ts
│   ├── repairReceiptController.ts
│   ├── metalRateController.ts
│   └── settingsController.ts
│
├── models/
│   ├── Admin.ts
│   ├── Customer.ts
│   ├── Product.ts
│   ├── Invoice.ts
│   ├── RepairReceipt.ts
│   ├── MetalRate.ts
│   └── Settings.ts
│
├── middleware/
│   ├── auth.ts              # Authentication guard
│   └── adminLimit.ts        # Admin access & limits
│
├── utils/
│   ├── hashPassword.ts
│   ├── pdfGenerator.ts
│   └── qrcode.ts
│
└── types/
└── environment.d.ts     # Typed environment variables
textPredictable structure. Easy onboarding. Low cognitive load.

## Getting Started

### Prerequisites

- Node.js (LTS recommended)
- npm or yarn
- MongoDB (Local or MongoDB Atlas)

### Installation

```bash
git clone <repository-url>
cd backend
npm install
# or
yarn install
Environment Variables
Create a .env file in the project root.
textMONGO_URI=your-mongodb-connection-string
PORT=4000
JWT_SECRET=your-jwt-secret
Optional variables may include:

Email/SMS credentials
PDF branding assets
Advanced admin configuration

Type safety is enforced via environment.d.ts.
Running the Server
Development
Bashnpm run dev
Uses live reload (e.g., nodemon or ts-node-dev).
Production
Bashnpm run build
npm start
The server listens on process.env.PORT or defaults to 4000.
Healthcheck
GET /
Returns a simple response confirming the API is running.
API Overview
Base URL
Local: http://localhost:4000

Admin/api/admin
Admin registration & login, role management, access limit enforcement
Customers/api/customers
Create, update, delete customers · Search by name/mobile · Fetch related invoices/repairs
Products/api/products
Jewelry product catalog management
Invoices/api/invoices
Create and manage sales invoices · PDF and QR code generation
Repair Receipts/api/repair-receipts
Track jewelry repairs and delivery status
Metal Rates/api/metal-rates
Manage daily gold/silver rates (used across billing)
Shop Settings/api/shop-settings
Shop profile, invoice/receipt configuration
PDF & QR/api/pdf
Generate printable invoices and repair receipts

Authentication & Authorization

JWT-based authentication via auth.ts
Admin limits enforced via adminLimit.ts
Passwords hashed before storage

Security first. Always.
PDF & QR Code Generation

PDFs generated using pdfGenerator.ts
QR codes embedded via qrcode.ts
Templates are configurable and reusable

Print-ready. Audit-friendly. No surprises.
Contributing

Fork the repository
Create a feature branch
Commit with clear, descriptive messages
Open a pull request with details

Clean code wins respect. Always.
License
MIT License
Copyright (c) 2025 SuvarnaDesk
Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, subject to the following conditions:
The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.