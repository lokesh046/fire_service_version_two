import API from "./axios";

export interface ChatServiceResponse {
  state?: Record<string, unknown>;
  tools_used?: string[];
  tool_results?: Record<string, unknown>;
  advisor_explanation?: string;
  flags?: string[];
  error?: string;
  details?: unknown;
}

export const chatWithAgent = async (
  message: string,
): Promise<ChatServiceResponse> => {
  const response = await API.post("/chat-agent", { message });
  return response.data;
};

