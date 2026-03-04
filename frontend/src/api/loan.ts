import API from "./axios";

export interface LoanOnlyInput {
  loan_amount: number;
  interest_rate_value: number;
  rate_type: string;
  tenure_years: number;
}

export const loanAnalysis = async (data: LoanOnlyInput) => {
  const response = await API.post("/loan", data);
  return response.data;
};

export const getLoanHistory = async () => {
  const response = await API.get("/loan/history");
  return response.data;
};

// Same shape as FireInput on backend for loan-FIRE strategy
export interface LoanFireStrategyInput {
  monthly_income: number;
  living_expense: number;
  current_savings: number;
  return_rate: number;
  inflation_rate: number;
  has_loan: string;
  loan_amount: number;
  interest_rate_value: number;
  rate_type: string;
  loan_emi: number;
  loan_years: number;
  has_insurance: string;
}

export interface LoanFireStrategyResult {
  current_fire_year: number;
  optimized_fire_year: number;
  recommended_emi: number;
  strategy_recommendation: string;
  ai_explanation: Record<string, unknown>;
  loan_details: {
    original_emi: number;
    optimal_emi: number;
    interest_savings: number;
  };
  user_id: string;
}

export const compareLoanFireStrategy = async (
  data: LoanFireStrategyInput
): Promise<LoanFireStrategyResult> => {
  const response = await API.post("/loan-fire-strategy", data);
  return response.data;
};