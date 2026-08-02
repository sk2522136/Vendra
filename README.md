# Vendra - Sales & Inventory Management System

<div align="center">

![Express](https://img.shields.io/badge/version-1.0.0-blue.svg)
![Reactjs](https://img.shields.io/badge/license-MIT-green.svg)
![Live Demo](https://img.shields.io/badge/status-Production-brightgreen.svg)
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

- Live Application: http://vndra.duckdns.org
- Demo Credentials:
  - Email: demo@example.com
  - Password: Demo@123


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
- React-hot-toast
- lucide-react

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
- AI Integration: Google Gemini API

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
# MongoDB setup
MONGO_URI=mongodb+srv://your-user:your-password@your-cluster.mongodb.net/vendra?retryWrites=true&w=majority

# JWT secret
JWT_SECRET=your_jwt_secret
NODE_ENV=development

# Email setup
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_app_password

# Cloudinary setup
CLOUD_NAME=your_cloud_name
CLOUD_API_KEY=your_cloudinary_api_key
CLOUD_API_SECRET=your_cloudinary_api_secret

# Stripe setup
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_PUBLIC_KEY=your_stripe_public_key
STRIPE_PRO_PRODUCT_ID=your_stripe_product_id
STRIPE_PRO_PRICE_ID=your_stripe_price_id
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

# Gemini setup
GEMINI_API_KEY=your_gemini_api_key

# Encryption key
ENCRYPTION_KEY=your_encryption_key
SCHEDULE_BACKUP_TIME=0 0 * * *

# Frontend URL
FRONTEND_URL=http://localhost:5173
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
- Production: https://vndra.duckdns.org/

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
SALES INVENTORY SYSTEM/
├── client/                    # Frontend React app
│   ├── public/                # Static assets
│   └── src/                   # Main source code
│       ├── components/        # Reusable UI components
│       ├── context/           # Auth and shared context
│       ├── pages/             # Main app pages
│       ├── services/          # API service layer
│       └── utils/             # Frontend helpers
│
├── server/                    # Backend Express app
│   ├── config/                # DB and Cloudinary config
│   ├── controllers/           # Business logic
│   ├── middleware/            # Auth, role, tenant checks
│   ├── models/                # MongoDB schemas
│   ├── routes/                # API endpoints
│   ├── schemas/               # Validation schemas
│   └── utils/                 # Helper utilities
│
├── doc/                       # Documentation files
├── docker-compose.yml         # Container setup
├── README.md                  # Deployment guide
└── .env                       # Environment variables
```

---


## 🚀 Deployment


#### AWS EC2 

1. **Launch an AWS Instance and Connect**
   - Sign in to the AWS Console and open the EC2 service.
   - Click on "Launch Instance".
   - Choose **Ubuntu 22.04 LTS or 24.04 LTS** as the operating system.
   - Select an instance type such as **t2.micro** or **t3.micro**.
   - Create a key pair and download the `.pem` file.
   - In the security group, allow SSH, HTTP, and HTTPS traffic.
   - Connect to the instance using SSH:

```bash
open the terminal 
ssh -i "path\your-key.pem" ubuntu@<your-ec2-public-ip>
```

2. **Set Up the Server**

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y docker.io docker-compose-plugin git curl
sudo systemctl enable docker
sudo systemctl start docker
sudo usermod -aG docker $USER
newgrp docker
```

3. **Clone the Repository and Configure the App**

```bash
git clone <your-repo-url>
cd Vendra
nano .env
```

4. **Environment Variables**
   - Add the required secrets, database credentials, and JWT values in the `.env` file.
   - Set `NODE_ENV=production`.
   - Ensure the `.env` file is included in `.gitignore`.

5. **Build and Run the Containers**

```bash
docker compose up -d --build
docker compose ps
```

6. **Useful Maintenance Commands**

```bash
docker compose logs -f
docker compose restart
git pull origin main
docker compose up -d --build
```

---

## 🤝 Contributing

Contributions are welcome. If you want to improve this project, please follow the steps below.

1. **Fork the Repository**

```bash
git clone <your-fork-url>
cd Vendra
```

2. **Create a Feature Branch**

```bash
git checkout -b feature/your-feature-name
```

3. **Make Your Changes**

- Keep the code consistent with the existing structure
- Follow the current frontend and backend patterns
- Update documentation if you change features or setup steps

4. **Commit and Push**

```bash
git add .
git commit -m "Add your feature"
git push origin feature/your-feature-name
```

5. **Open a Pull Request**

- Describe the change clearly
- Mention any related issue or feature request
- Include screenshots or notes if the UI changes

### Development Guidelines

- Follow the existing code style and conventions
- Keep API changes well documented
- Add or update tests where possible
- Ensure the app still runs correctly after your changes
- Be careful with environment variables and sensitive credentials

---

## 🔐 Security

### Implemented Security Measures

- JWT-based authentication with secure cookie handling
- Role-based and tenant-based access control
- Input validation with Joi schemas for API requests
- Rate limiting on login attempts to prevent brute-force access
- Secure CORS configuration for frontend-backend communication
- CSRF protection for state-changing requests
- XSS-style input sanitization on server-side request data
- Security headers such as X-Content-Type-Options, X-Frame-Options, and X-XSS-Protection
- HTTPS-ready configuration for production deployment

---

## ⚡ Performance

- Performance: 90+
- Accessibility: 95+
- Best Practices: 90+
- SEO: 90+

---

## 👤 Author

**Sahil Kumar**

- GitHub: [@sk2522136](https://github.com/sk2522136)
- Email: sk2522136@gmail.com

---

## ⭐ Support

If you find this project helpful, please give it a star on GitHub.

**Built with ❤️ for modern retail and inventory management.**

---

## 📄 License

This project is licensed under the MIT License. See the LICENSE file for details.

```text
MIT License

Copyright (c) 2026 Sahil Kumar

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

