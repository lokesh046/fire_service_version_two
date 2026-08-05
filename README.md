# 🚀 Wealth to FIRE — Financial Intelligence Platform

**Wealth to FIRE** is an enterprise-grade financial decision-support and intelligence platform. It helps users calculate their FIRE (Financial Independence, Retire Early) goals, optimize loan repayment strategies against compound investments, grade overall financial health, and interact with a RAG-powered AI financial assistant.

---

## 🏗️ System Architecture Overview

The system is organized into a modular monorepo structure comprising a **FastAPI Microservices Backend** and a **React (Vite) Frontend**:

```
fire_service_version_two/
├── fire-number--final-year-pro/   # Backend Microservices & API Gateway
│   ├── api_gateway/               # FastAPI Gateway (Routing, Unified Endpoints & Auth)
│   ├── fire_service/              # FIRE calculation engine & wealth projections
│   ├── loan_optimzer_service/     # EMI calculator & loan pre-payment optimization
│   ├── health_service/            # Financial health scoring engine (0-100 scale)
│   ├── explain_service/           # RAG Explanation Pipeline (ChromaDB + Gemini LLM)
│   ├── chat_service/              # AI Financial Conversational Agent & Tool Executor
│   ├── shared/                    # Database models, auth mechanisms & DB drivers
│   ├── alembic/                   # Database schema migration scripts
│   └── docs/                      # OpenAPI schemas & documentation assets
│
└── frontend/                      # React 18 + TypeScript SPA
    ├── src/
    │   ├── api/                   # Axios/Fetch API client wrappers
    │   ├── components/            # Reusable UI components & layouts
    │   ├── pages/                 # Full application pages & route components
    │   ├── store/                 # Global state management via Zustand
    │   ├── App.tsx                # Client-side routing setup
    │   └── main.tsx               # Entry point
    └── dist/                      # Production build output
```

---

## ✨ Key Features & Capabilities

- **🔥 FIRE Calculator**: Computes target retirement corpus, estimated retirement year, and projected net-worth trajectory accounting for savings rate, investment return, inflation, and active loans.
- **💳 Loan EMI & Debt Strategy Optimizer**: Calculates monthly EMI, generates full amortization schedules, and evaluates debt pre-payment vs. investing trade-offs.
- **📊 Financial Health Score**: Evaluates financial stability on a 0–100 scale based on debt-to-income ratio, savings ratio, emergency fund status, and insurance coverage.
- **🧠 RAG AI Explainability Service**: Harnesses Google Gemini API and ChromaDB vector store to provide contextualized explanations of financial decisions and strategy suggestions.
- **💬 Conversational AI Assistant**: Stateful financial chat agent capable of interpreting financial intent, triggering backend tools, and maintaining conversation history.
- **🔐 Secure Authentication**: Includes JWT authentication (HTTP-only Cookies & Bearer tokens), email OTP verification, and secure 15-minute tokenized password resets.

---

## 🛠️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend Framework** | React 18, TypeScript, Vite |
| **Styling & Motion** | TailwindCSS, Framer Motion, Lucide Icons |
| **State Management** | Zustand |
| **Charts & Data Visualization** | Recharts / Chart.js |
| **Backend Framework** | Python 3.10+, FastAPI, Uvicorn |
| **ORM & Database** | SQLAlchemy 2.0 (Async), PostgreSQL (NeonDB / Asyncpg), Alembic |
| **Vector DB & AI** | ChromaDB, Google Gemini API (`google-genai` / `google-generativeai`) |
| **Authentication** | Passlib / Pwdlib, PyJWT, HTTP-only Cookies |
| **Email Service** | Python `smtplib` over TLS |

---

## ⚡ Quick Start Guide

### Prerequisites

- **Python**: `3.10` or higher
- **Node.js**: `18.x` or higher
- **PostgreSQL Database**: Local PostgreSQL instance or cloud database (e.g. NeonDB)

---

### 1. Environment Configuration

Create a `.env` file inside `fire-number--final-year-pro/`:

```env
# Database Connection (Asyncpg required)
DATABASE_URL=postgresql+asyncpg://postgres:password@localhost:5432/wealth_fire_db

# JWT & Security
SECRET_KEY=your_super_secret_jwt_key_here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=10080

# Production URLs & Origins
FRONTEND_URL=http://localhost:5173

# AI & RAG Configuration
GEMINI_API_KEY=your_google_gemini_api_key

# Email SMTP Credentials (Optional - logs to terminal if omitted)
SMTP_EMAIL=your_email@gmail.com
SMTP_APP_PASSWORD=your_gmail_app_password
```

---

### 2. Backend Setup & Startup

```bash
# Navigate to backend directory
cd fire-number--final-year-pro

# Create and activate virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run database migrations (optional if auto-synced)
alembic upgrade head

# Start API Gateway dev server
uvicorn api_gateway.main:app --reload --port 8000
```
> The API Gateway will be available at: `http://localhost:8000`  
> Interactive OpenAPI documentation: `http://localhost:8000/docs`

---

### 3. Frontend Setup & Startup

Open a new terminal window:

```bash
# Navigate to frontend directory
cd frontend

# Install Node dependencies
npm install

# Start Vite dev server
npm run dev
```
> The web application will be accessible at: `http://localhost:5173`

---

## 🌐 API Overview

| Endpoint | Method | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `/auth/register` | `POST` | Register new user & send OTP | ❌ |
| `/auth/verify-email` | `POST` | Verify user email with OTP code | ❌ |
| `/auth/login` | `POST` | Authenticate user & issue JWT cookie | ❌ |
| `/auth/forgot-password` | `POST` | Send password reset email link | ❌ |
| `/auth/reset-password` | `POST` | Reset password using emailed token | ❌ |
| `/calculate-fire` | `POST` | Calculate FIRE timeline & financial health | ✅ |
| `/loan-fire-strategy` | `POST` | Compare loan optimization against FIRE | ✅ |
| `/loan-only` | `POST` | Standalone EMI & amortization schedule | ✅ |
| `/dashboard` | `POST` | Fetch complete user financial dashboard | ✅ |
| `/chat` | `POST` | Query AI Financial Assistant | ✅ |
| `/explain` | `POST` | Generate RAG AI financial strategy report | ✅ |

---

## 🔒 Security Best Practices

1. **Password Security**: Passwords are hashed using bcrypt algorithm.
2. **OTP Protection**: Verification codes expire in 10 minutes and lock after 3 failed attempts.
3. **Password Reset Links**: Tokenized links contain `user_id:raw_token` to prevent bcrypt DoS attacks and expire in 15 minutes.
4. **JWT Security**: Issued over HTTP-only cookies with configurable `FRONTEND_URL` for CORS protection.

---

## 📄 License

This repository is maintained for the **Wealth to FIRE** platform. All rights reserved.
