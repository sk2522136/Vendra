# Vendra - Sales & Inventory Management System

<div align="center">

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Status](https://img.shields.io/badge/status-Production-brightgreen.svg)
![Node](https://img.shields.io/badge/node-v22-blue.svg)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas%2FLocal-green.svg)

**A modern retail management platform for POS, inventory, analytics, billing, and AI-assisted operations**

[Live Demo](#-live-demo) • [Features](#-features) • [Installation](#-installation) • [API Documentation](#-api-documentation) • [Deployment](#-deployment)

</div>

---

## 🎯 Overview

Vendra is a complete sales and inventory management system designed for modern retail businesses. It helps stores manage products, stock, sales, customers, suppliers, expenses, analytics, billing, and support operations from one unified platform.

Perfect for:
- Retail stores
- Supermarkets
- Boutiques
- Restaurants and cafes
- Small and medium businesses with inventory needs

---

## 🚀 Live Demo

- Live Application: https://your-domain.com
- Demo Credentials:
  - Email: demo@example.com
  - Password: Demo@123
- Admin Panel: https://your-domain.com/admin

---

## ✨ Features

### 🛍️ Core Retail Features
- Product creation, update, delete and category-based listing
- Real-time stock tracking and inventory history
- Sales creation, updates, deletion and return handling
- Customer and supplier management
- Expense creation and reporting
- Sales analytics with charts and top-selling product insights
- Receipt generation for completed sales and payments

### 🔐 Authentication & Access Control
- Signup, login, logout and refresh-token based authentication
- Role-based access for admin, staff, manager, cashier and super_admin
- Tenant-based organization access for multi-store operations
- Email verification for staff accounts

### 💳 Billing & Subscription
- Free trial activation
- Stripe checkout flow for Pro plan
- Subscription status, upgrade and cancel flow
- Webhook-based payment confirmation

### 🤖 AI & Smart Features
- Gemini AI chatbot support for store and product-related questions
- Voice command parsing for hands-free POS interactions
- Real-time Socket.IO updates for live retail activity
- Automated backup creation, restore and status monitoring
- Scheduled backup automation for business continuity
- Super admin dashboard and tenant plan management

---

## 🛠️ Tech Stack

### Frontend
- React 19
- Vite
- React Router DOM
- Tailwind CSS
- Axios
- Recharts
- Socket.IO client
- React Icons

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT + cookies
- Socket.IO
- Stripe
- Cloudinary
- Nodemailer
- Joi validation

### DevOps
- Docker Compose
- AWS EC2 deployment support
- Nginx optional for reverse proxy

---

## 📦 Installation

### Prerequisites
- Node.js 18+
- MongoDB running locally or via MongoDB Atlas
- npm
- Docker (optional for production deployment)

### Backend Setup
```bash
cd server
npm install
npm run dev
```

### Frontend Setup
```bash
cd client
npm install
npm run dev
```

### Environment Variables

#### Backend (.env)
```env
PORT=4000
MONGO_URI=your_mongodb_connection_string
FRONTEND_URL=http://localhost:5173
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_PRO_PRODUCT_ID=your_product_id
STRIPE_PRO_PRICE_ID=your_price_id
STRIPE_WEBHOOK_SECRET=your_webhook_secret
```

#### Frontend (.env)
```env
VITE_API_URL=http://localhost:4000/api
VITE_STRIPE_PUBLIC_KEY=your_stripe_public_key
VITE_SOCKET_URL=http://localhost:4000
```

---

## 📚 API Documentation

### Base URL
- Development: http://localhost:4000/api
- Production: http://your-domain-or-ec2-ip/api

### Authentication
- POST /auth/signup
- POST /auth/login
- POST /auth/register
- POST /auth/logout
- POST /auth/refresh
- GET /auth/is-auth
- GET /auth/staff
- DELETE /auth/staff/:id
- GET /auth/verify-email/:token

### Products
- GET /product
- POST /product/create
- GET /product/category/:id
- GET /product/:id
- PUT /product/:id
- DELETE /product/:id

### Categories
- GET /category
- POST /category/create
- PUT /category/:id
- DELETE /category/:id

### Sales
- POST /sale/create
- GET /sale/customer/:customerId
- PUT /sale/:id
- DELETE /sale/:id
- POST /sale/:id/return

### Customers
- GET /customer

### Inventory
- GET /inventory/status
- GET /inventory/history/:productId

### Suppliers
- GET /supplier
- POST /supplier/create
- GET /supplier/:id
- PUT /supplier/:id
- DELETE /supplier/:id
- POST /supplier/:id/purchase
- POST /supplier/:id/payment

### Expenses
- POST /expense/create
- GET /expense/list

### Analytics
- GET /analytical/sale
- GET /analytical/profit
- GET /analytical/payment
- GET /analytical/products

### Payments
- POST /payment/create-intent
- POST /payment/confirm-stripe-payment

### Chatbot
- POST /chatbot/message

### Voice
- POST /voice/parse-command

### Backup
- GET /backup/download
- POST /backup/restore
- GET /backup/status

### Billing / Subscription
- GET /billing/plans
- POST /billing/subscribe
- POST /billing/confirm-payment
- PUT /billing/upgrade
- DELETE /billing/cancel
- GET /billing/status
- POST /billing/webhook

### Super Admin
- GET /super-admin/stats
- GET /super-admin/tenants
- PATCH /super-admin/tenants/:id/status
- PATCH /super-admin/tenants/:id/plan
- GET /super-admin/revenue

---

## 📁 Project Structure

```text
vendra/
├── client/                          # React frontend
│   ├── src/
│   │   ├── components/             # Reusable UI components
│   │   ├── context/               # Authentication context
│   │   └── pages/                 # Dashboard, POS, Inventory, Reports, etc.
│
├── server/                          # Express backend
│   ├── controllers/                # Business logic
│   ├── models/                     # MongoDB schemas
│   ├── routes/                     # API routes
│   ├── middleware/                 # Auth, tenant and role checks
│   └── utils/                      # Helpers, Stripe, backup, Gemini, voice
│
├── docker-compose.yml              # Multi-container setup
└── doc/                            # Documentation files
```

---

## 🚀 Deployment

### AWS EC2 Deployment
This project is ready for deployment on AWS EC2 using Docker Compose.

#### Quick Steps
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y docker.io docker-compose-plugin git curl
sudo systemctl enable docker
sudo systemctl start docker
sudo usermod -aG docker $USER
```

```bash
git clone <your-repo-url>
cd SALES-INVENTORY-SYSTEM
cp .env.example .env
sudo docker compose up -d --build
```

