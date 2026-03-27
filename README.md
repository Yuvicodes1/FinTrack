<div align="center">
<h1>FinTrack</h1>
<p><strong>Real-time portfolio tracking, AI expense insights, and live market data — all in one beautiful platform built for the modern investor.</strong></p>

<img src="https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react" />
<img src="https://img.shields.io/badge/Node.js-Express-339933?style=flat-square&logo=node.js" />
<img src="https://img.shields.io/badge/MongoDB-Atlas-47A248?style=flat-square&logo=mongodb" />
<img src="https://img.shields.io/badge/Firebase-Auth-FFCA28?style=flat-square&logo=firebase" />
<img src="https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=flat-square&logo=tailwind-css" />

</div>

---

## Login at : https://fin-track-zeta-one.vercel.app/

## Overview

**FinTrack** is a full-stack personal finance platform that combines real-time stock portfolio management with an AI-powered expense tracker. Built with a modern MERN stack, it provides individuals with a comprehensive view of their financial health — investments, expenses, and market data.

> *"Earn with Us, Learn with Us."*

---

## Features

### Investment Tracker
- **Real-time stock prices** powered by Finnhub API (140+ symbols across 11 sectors)
- **Live P&L calculations** — know your profit/loss at a glance
- **Multi-currency support** — 3 supported currencies : USD, INR, EUR with live conversion rates
- **Portfolio management** — add, edit, delete holdings with full CRUD
- **Historical charts** — 1M, 6M, 1Y performance via Yahoo Finance and Yahoo history
- **Watchlist** — bookmark stocks for quick access
- **CSV & PDF export** of your entire portfolio

### Expense Manager
- **Monthly expense logging** with 7 categories (Food, Transport, Shopping, etc.)
- **Salary tracking** with remaining budget calculation
- **Category-wise pie chart** breakdown using Recharts
- **Month navigator** to browse historical spending
- **AI-powered chat assistant** — ask questions about your spending habits, powered by **HuggingFace Mistral-7B**

### 🎨 UI/UX
- **Dark/Light mode** with smooth transitions
- **Fully responsive** — mobile, tablet, desktop
- **Playfair Display + DM Sans** typography for a premium feel

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19, Vite, Tailwind CSS, Recharts |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB Atlas |
| **Auth** | Firebase Authentication (Email + Google OAuth) |
| **Market Data** | Finnhub API, Yahoo Finance |
| **AI Chat** | HuggingFace Inference API (Mistral-7B) |
| **Currency** | Open Exchange Rates API |
| **Deployment** | Vercel (frontend), Render (backend) |

---

## Architecture

```
FinTrack/
├── frontend/                  # React + Vite
│   ├── src/
│   │   ├── pages/             # Landing, Login, Home, Dashboard, Market, Portfolio, Expenses, Settings, StockDetails
│   │   ├── components/        # Reusable UI components
│   │   │   ├── layout/        # Sidebar, Topbar, AppLayout
│   │   │   ├── dashboard/     # PortfolioChart, ExpenseChart
│   │   │   └── ...            # Modals, AIChat, AnimatedList, CurvedLoop, MoneyLoader
│   │   ├── context/           # AuthContext, ThemeContext, CurrencyContext
│   │   ├── services/          # Axios API service
│   │   └── routes/            # AppRoutes with ProtectedRoute
│   └── vercel.json            # SPA routing config
│
└── backend/                   # Node + Express
    ├── controllers/           # market, portfolio, expense, watchlist, user
    ├── models/                # User, Portfolio, Expense, Watchlist
    ├── routes/                # All API routes
    ├── services/              # stockService, currencyService
    ├── middleware/            # verifyToken, asyncHandler, errorHandler
    └── utils/                 # cache (TTL-based in-memory)
```

---

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/Yuvicodes1/FinTrack.git
cd FinTrack
```

### 2. Backend setup

```bash
cd backend
npm install
```

Create `backend/.env`:

```env
MONGO_URI=your_mongodb_connection_string
FINNHUB_API_KEY=your_finnhub_key
HUGGINGFACE_API_KEY=your_huggingface_key
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=your_client_email
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
PORT=5000
```

```bash
npm start
```

### 3. Frontend setup

```bash
cd frontend
npm install
npm run dev
```

App runs at `http://localhost:5173`

---

## Deployment

| Service | Platform | URL |
|---|---|---|
| Frontend | Vercel | [fin-track-lovat-beta.vercel.app](https://fin-track-lovat-beta.vercel.app) |
| Backend | Render | https://fintrack-nooh.onrender.com |
| Database | MongoDB Atlas | Cloud hosted |

---

## Screenshots

> Landing Page · Dashboard · Market · Expense Manager
### Light UI
<img width="1919" height="1026" alt="image" src="https://github.com/user-attachments/assets/cbb46c48-319a-4eb6-b996-d04a4b5c8060" />
<img width="1902" height="839" alt="image" src="https://github.com/user-attachments/assets/1c7ec761-a7df-4a50-8219-10ea063c90f5" />
<img width="1916" height="1029" alt="image" src="https://github.com/user-attachments/assets/741f4afe-78cc-4514-913b-99d78ea0ed47" />
<img width="1919" height="1026" alt="image" src="https://github.com/user-attachments/assets/bd6e94dd-3c19-4a7f-9db5-70e9684da7d0" />
<img width="1919" height="1027" alt="image" src="https://github.com/user-attachments/assets/b2e8390f-ac5d-46ed-b7d5-7521ac6e911b" />
<img width="1919" height="1032" alt="image" src="https://github.com/user-attachments/assets/09cc4b6c-7ae7-4a4b-915f-dc27d3ea8ba0" />


### Dark UI
<img width="1894" height="1030" alt="image" src="https://github.com/user-attachments/assets/fdc6c037-3afc-4417-aa34-85b7c569d2b2" />
<img width="1918" height="1027" alt="image" src="https://github.com/user-attachments/assets/fec68b08-48ca-4d51-be14-2f128b6aa8ed" />
<img width="1919" height="1024" alt="image" src="https://github.com/user-attachments/assets/764e1834-ab00-46a5-8b0a-4cabd0b455c8" />
<img width="1919" height="1031" alt="image" src="https://github.com/user-attachments/assets/16091d02-a5e0-4308-bf7c-4bccc8037e42" />
<img width="1919" height="1026" alt="image" src="https://github.com/user-attachments/assets/2d616708-c150-479b-99af-33fc9a608a36" />
<img width="1919" height="1029" alt="image" src="https://github.com/user-attachments/assets/816c1b65-2268-4e6d-b0fb-da53f34d3d5d" />



---

## Testing

Automated E2E testing with Selenium WebDriver + Mocha:

```bash
npm install selenium-webdriver chromedriver mocha mochawesome --save-dev
npx mocha test.spec.js --reporter mochawesome --reporter-options reportDir=report,reportFilename=fintrack-report
```

Covers 35 test cases across all 10 pages including auth, navigation, modals, and protected routes.

<div align="center">
  <p>Built with ❤️ by Yathaartha Srivastava</p>
  <p>
    <a href="https://fin-track-lovat-beta.vercel.app">🚀 Try FinTrack Live</a>
  </p>
</div>
