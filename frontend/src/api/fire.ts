import API from "./axios";

export interface FireInput {
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

export const calculateFire = async (data: FireInput) => {
  const response = await API.post("/calculate-fire", data);
  return response.data;
};

export const getFireHistory = async () => {
  const response = await API.get("/fire/history");
  return response.data;
};

export const getFireExplanation = async (data: FireInput) => {
  const response = await API.post("/loan-fire-strategy", data);
  return response.data;
};