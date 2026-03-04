import API from "./axios";

export interface DashboardData {
  user: { id: string; email: string; role?: string };
  fire: {
    fire_number: number | null;
    fire_year: number | null;
    final_wealth: number | null;
    monthly_income: number | null;
    current_savings: number | null;
    last_updated: string | null;
  } | null;
  health: {
    score: number | null;
    debt_ratio: number | null;
    savings_ratio: number | null;
    last_updated: string | null;
  } | null;
  loans: {
    total_simulations: number;
    latest_loan: {
      loan_amount: number | null;
      optimal_emi: number | null;
      total_interest: number | null;
    } | null;
  };
}

export const getDashboard = async (): Promise<DashboardData> => {
  const response = await API.get("/dashboard");
  return response.data;
};

export const getHealthHistory = async () => {
  const response = await API.get("/health/history");
  return response.data;
};