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
  history?: { role: string; content: string }[],
  state?: Record<string, unknown>
): Promise<ChatServiceResponse> => {
  const payload: any = { message };
  if (history && history.length > 0) payload.history = history;
  if (state && Object.keys(state).length > 0) payload.state = state;
  const response = await API.post("/chat-agent", payload);
  return response.data;
};

