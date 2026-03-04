import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Layout } from "./components/Layout";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import { Dashboard } from "./pages/Dashboard";
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
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="fire" element={<FireCalculator />} />
          <Route path="loan-strategy" element={<LoanStrategy />} />
          <Route path="loan" element={<LoanOnly />} />
          <Route path="chat" element={<Chat />} />
          <Route path="history/fire" element={<FireHistory />} />
          <Route path="history/health" element={<HealthHistory />} />
          <Route path="history/loans" element={<LoanHistory />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
