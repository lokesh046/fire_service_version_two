# 🐍 Wealth to FIRE — Backend Microservices & API Gateway

This directory contains the Python FastAPI backend for the **Wealth to FIRE** platform. It provides financial planning engines, debt optimization, financial health scoring, a RAG explainability service, an AI financial chat assistant, and database management.

---

## 📐 Backend Architecture

The backend operates as a unified API Gateway with underlying modular domain engines:

```
fire-number--final-year-pro/
├── api_gateway/               # Main FastAPI entry point & unified routing
│   └── main.py                # Gateway app, CORS, middleware & endpoints
├── fire_service/              # FIRE calculations engine
│   ├── fire_engine.py         # Compound interest & retirement year calculator
│   └── main.py                # Direct microservice endpoints
├── loan_optimzer_service/     # Loan calculation & debt strategy
│   ├── loan_engine.py         # EMI, amortization schedule & optimization algorithms
│   └── main.py                # Direct loan service routes
├── health_service/            # Financial Health Scoring
│   ├── financial_health_score.py # 0-100 score & financial ratio evaluator
│   └── main.py                # Health score routes
├── explain_service/           # RAG Financial Strategy Explanation
│   ├── pipeline/              # Retrieval, prompt builder & Gemini LLM client
│   └── main.py                # RAG explanation endpoint
├── chat_service/              # AI Financial Chatbot & Agent Engine
│   ├── orchestrator.py        # Intent parser & execution planner
│   ├── tool_executor.py       # Invokes internal calculation tools
│   ├── financial_interpreter.py # Natural language finance interpreter
│   ├── memory_redis.py        # Chat state persistence
│   └── main.py                # Chat router & stream endpoints
├── shared/                    # Reusable modules & infrastructure
│   ├── models/                # SQLAlchemy ORM models (User, Fire, Loan, Health, Chat)
│   ├── services/              # Authentication, email dispatcher, DB queries
│   └── database.py            # Async engine & sessionmaker configuration
└── alembic/                   # Database migrations
```

---

## 🔧 Environment Configuration

Create a `.env` file in `fire-number--final-year-pro/`:

```env
# Database Settings (Requires asyncpg driver for PostgreSQL)
DATABASE_URL=postgresql+asyncpg://postgres:password@localhost:5432/wealth_fire_db

# Security & JWT Tokens
SECRET_KEY=your_super_secret_jwt_key_here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=10080

# Application URLs
FRONTEND_URL=http://localhost:5173

# AI & RAG Configuration (Google Gemini)
GEMINI_API_KEY=your_gemini_api_key_here

# SMTP Email Configuration (Optional - falls back to mock console logs)
SMTP_EMAIL=your_email@gmail.com
SMTP_APP_PASSWORD=your_app_password
```

---

## 🚀 Installation & Setup

1. **Create and Activate Virtual Environment**:
   ```bash
   python3 -m venv venv
   source venv/bin/activate
   ```

2. **Install Dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Database Setup**:
   Ensure PostgreSQL is running and your database is created. Then run migrations:
   ```bash
   alembic upgrade head
   ```

4. **Run the API Gateway Server**:
   ```bash
   uvicorn api_gateway.main:app --reload --port 8000
   ```

5. **Access OpenAPI Docs**:
   - Swagger UI: `http://localhost:8000/docs`
   - ReDoc: `http://localhost:8000/redoc`

---

## ⚡ Core Domain Engines

### 1. FIRE Engine (`fire_service/fire_engine.py`)
- Calculates total FIRE target corpus: $\text{Target Corpus} = (\text{Annual Living Expenses}) \times 25$.
- Projects wealth year-by-year considering expected rate of return and inflation rate.
- Incorporates monthly loan EMI obligations to accurately estimate the exact retirement year.

### 2. Loan Optimization Engine (`loan_optimzer_service/loan_engine.py`)
- Equated Monthly Installment (EMI) formula:
  $$EMI = P \times r \times \frac{(1 + r)^n}{(1 + r)^n - 1}$$
- Generates full month-by-month amortization breakdown (principal vs. interest).
- Simulates pre-payment scenarios (higher EMI) and calculates total interest saved and years saved.

### 3. Financial Health Engine (`health_service/financial_health_score.py`)
- Grades financial health on a 0–100 scale based on:
  - Debt-to-income ratio (lower is better)
  - Savings-to-income ratio (higher is better)
  - Emergency fund readiness
  - Life & health insurance coverage

### 4. RAG AI Explainability Engine (`explain_service/`)
- Vector store with ChromaDB indexing financial guidance, tax rules, and debt strategies.
- Prompts Google Gemini LLM with relevant retrieved context to produce structured explanations for loan vs. FIRE recommendations.

### 5. Financial Chat Assistant (`chat_service/`)
- Natural language financial agent capable of performing intent extraction, tool invocation (FIRE calculation, EMI check, Health scoring), and context memory.

---

## 🔐 Authentication & Security

- **JWT Tokens**: Embedded inside HTTP-only cookies (`access_token`) and supported in `Authorization: Bearer <token>` headers.
- **OTP Verification**: Email verification codes hashed using bcrypt, valid for 10 minutes with a max 3 attempt retry policy.
- **Password Reset**: Cryptographically safe tokens formatted as `user.id:raw_token`, valid for 15 minutes.
- **Dynamic Frontend URL**: Uses `FRONTEND_URL` environment variable to formulate password reset links dynamically for production deployments.

---

## 🧪 Testing & Code Quality

- Run backend tests (if configured):
  ```bash
  pytest
  ```
