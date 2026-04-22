import API from "./axios";

export interface LoginData {
  email: string;
  password: string;
}

// Backend expects OAuth2 form: username (email) + password
export const loginUser = async (data: LoginData) => {
  const form = new URLSearchParams();
  form.set("username", data.email);
  form.set("password", data.password);

  const response = await API.post("/auth/login", form, {
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });
  return response.data;
};

export const registerUser = async (data: {
  username: string;
  email: string;
  password: string;
}) => {
  const response = await API.post("/auth/register", data);
  return response.data;
};

export const logoutUser = async () => {
  const response = await API.post("/logout");
  return response.data;
};

export const getMe = async () => {
  const response = await API.get("/me");
  return response.data;
};

export const resetPassword = async (data: { email: string; new_password: string }) => {
  const response = await API.post("/auth/reset-password", data);
  return response.data;
};