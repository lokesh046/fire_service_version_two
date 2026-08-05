# 💻 Wealth to FIRE — Frontend Application

This directory contains the React 18 single-page web application (SPA) built with TypeScript, Vite, TailwindCSS, Framer Motion, and Zustand for the **Wealth to FIRE** financial intelligence platform.

---

## 🎨 Technology Stack

- **Framework**: React 18, TypeScript, Vite
- **Styling**: TailwindCSS, CSS Variables, Glassmorphism design system
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **State Management**: Zustand
- **HTTP Client**: Axios / Fetch API client with credentials & cookie support
- **Build Tooling**: Vite, ESLint, TypeScript Compiler

---

## 📁 Directory Structure

```
frontend/
├── public/                    # Static public assets & icons
├── src/
│   ├── api/                   # API client layer & HTTP request functions
│   │   ├── auth.ts            # Auth requests (login, register, reset password)
│   │   ├── fire.ts            # FIRE calculation requests
│   │   ├── loan.ts            # Loan optimization requests
│   │   ├── health.ts          # Health score history requests
│   │   └── chat.ts            # AI Assistant chat endpoints
│   ├── components/            # UI Components
│   │   ├── Navbar.tsx         # Header navigation bar
│   │   ├── Footer.tsx         # Application footer
│   │   ├── HealthScoreBadge.tsx # Visual 0-100 score indicator
│   │   ├── FinancialCharts.tsx # Interactive charts
│   │   └── ProtectedRoute.tsx # Auth route guard wrapper
│   ├── pages/                 # Full Page Views
│   │   ├── Landing.tsx        # Product landing page
│   │   ├── Login.tsx          # Login form
│   │   ├── Register.tsx       # User registration form
│   │   ├── VerifyEmail.tsx    # Email OTP verification page
│   │   ├── ForgotPassword.tsx # Password reset request page
│   │   ├── ResetPassword.tsx  # New password entry page
│   │   ├── Dashboard.tsx      # Main financial summary dashboard
│   │   ├── FireCalculator.tsx # Interactive FIRE goal calculator
│   │   ├── LoanStrategy.tsx   # Loan payoff vs. investing comparison
│   │   ├── LoanOnly.tsx       # Standalone loan calculator
│   │   ├── Chat.tsx           # AI Financial Assistant interface
│   │   ├── FireHistory.tsx    # FIRE calculation history log
│   │   ├── HealthHistory.tsx  # Health score history log
│   │   ├── LoanHistory.tsx    # Loan simulation history log
│   │   ├── Report.tsx         # Printable financial summary report
│   │   └── AdminPanel.tsx     # Administrator management panel
│   ├── store/                 # Global Zustand state stores
│   │   └── authStore.ts       # Auth state (user details, logged-in status)
│   ├── App.tsx                # App router & layout configuration
│   └── main.tsx               # Main React DOM render entry point
├── package.json
├── vite.config.ts             # Vite server & proxy configuration
└── tailwind.config.js         # Tailwind styling setup
```

---

## 🚀 Setup & Execution

### Prerequisites

- **Node.js**: `18.x` or higher
- **npm**: `9.x` or higher

---

### Installation & Development Server

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Start Development Server**:
   ```bash
   npm run dev
   ```
   > App available at: `http://localhost:5173`

3. **Build for Production**:
   ```bash
   npm run build
   ```
   > Generates production-ready optimized assets in `dist/`.

4. **Preview Production Build**:
   ```bash
   npm run preview
   ```

---

## 🔑 Application Features & Views

### Authentication Flow
- **Registration**: [Register.tsx](file:///media/ganesh/2EB4C64AB4C613ED/fire_service_version_two/frontend/src/pages/Register.tsx) — Collects username, email, and password. Redirects to OTP verification.
- **Email OTP Verification**: [VerifyEmail.tsx](file:///media/ganesh/2EB4C64AB4C613ED/fire_service_version_two/frontend/src/pages/VerifyEmail.tsx) — Validates 6-digit verification code.
- **Login**: [Login.tsx](file:///media/ganesh/2EB4C64AB4C613ED/fire_service_version_two/frontend/src/pages/Login.tsx) — Authenticates user and sets HTTP-only session cookie.
- **Forgot & Reset Password**: [ForgotPassword.tsx](file:///media/ganesh/2EB4C64AB4C613ED/fire_service_version_two/frontend/src/pages/ForgotPassword.tsx) & [ResetPassword.tsx](file:///media/ganesh/2EB4C64AB4C613ED/fire_service_version_two/frontend/src/pages/ResetPassword.tsx) — Handles password recovery workflows.

### Financial Calculators & Dashboards
- **Dashboard**: [Dashboard.tsx](file:///media/ganesh/2EB4C64AB4C613ED/fire_service_version_two/frontend/src/pages/Dashboard.tsx) — Central hub displaying retirement targets, health scores, and quick calculation triggers.
- **FIRE Calculator**: [FireCalculator.tsx](file:///media/ganesh/2EB4C64AB4C613ED/fire_service_version_two/frontend/src/pages/FireCalculator.tsx) — Simulates retirement year and target corpus based on custom income/expense inputs.
- **Loan Strategy Optimizer**: [LoanStrategy.tsx](file:///media/ganesh/2EB4C64AB4C613ED/fire_service_version_two/frontend/src/pages/LoanStrategy.tsx) — Side-by-side comparison of debt pre-payment vs. investing.
- **AI Financial Assistant**: [Chat.tsx](file:///media/ganesh/2EB4C64AB4C613ED/fire_service_version_two/frontend/src/pages/Chat.tsx) — Real-time conversational AI drawer for answering finance questions.

---

## 🌐 API Communication & Proxy

In development mode, requests to `/api` or directly to `http://localhost:8000` are proxied to the backend FastAPI gateway.

- `withCredentials: true` is enabled on all Axios requests to automatically attach HTTP-only authentication cookies.
