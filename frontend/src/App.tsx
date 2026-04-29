import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Layout } from "./components/Layout";
import { Landing } from "./pages/Landing";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import { Dashboard } from "./pages/Dashboard";
import { VerifyEmail } from "./pages/VerifyEmail";
import { ForgotPassword } from "./pages/ForgotPassword";
import { ResetPassword } from "./pages/ResetPassword";
import { Report } from "./pages/Report";
import { AdminPanel } from "./pages/AdminPanel";
import { FireCalculator } from "./pages/FireCalculator";
import { LoanStrategy } from "./pages/LoanStrategy";
import { LoanOnly } from "./pages/LoanOnly";
import { FireHistory } from "./pages/FireHistory";
import { HealthHistory } from "./pages/HealthHistory";
import { LoanHistory } from "./pages/LoanHistory";
import { Chat } from "./pages/Chat";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Protected Routes */}
        <Route
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/report" element={<Report />} />
          <Route path="/fire" element={<FireCalculator />} />
          <Route path="/loan-strategy" element={<LoanStrategy />} />
          <Route path="/loan-only" element={<LoanOnly />} />
          <Route path="/loan" element={<LoanOnly />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/history/fire" element={<FireHistory />} />
          <Route path="/history/health" element={<HealthHistory />} />
          <Route path="/history/loans" element={<LoanHistory />} />
          <Route path="/admin" element={<AdminPanel />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
