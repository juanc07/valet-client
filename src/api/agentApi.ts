import { Agent } from "../interfaces/agent";
import { fetchWrapper } from "../utils/fetchWrapper";

export interface Task {
  task_id: string;
  status: "pending" | "in_progress" | "awaiting_external" | "completed" | "failed";
  result?: string;
  task_type?: "chat" | "api_call" | "blockchain_tx" | "mcp_action";
  external_service?: {
    service_name: string;
    response_data?: string | object;
    status?: "pending" | "success" | "failed";
    error?: string;
  };
}

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

export const createAgent = async (agentData: Omit<Agent, "id">): Promise<Agent & { _id: string }> => {
  return fetchWrapper(`${BASE_URL}/agents`, {
    method: "POST",
    body: JSON.stringify(agentData),
  });
};

export const getAllAgents = async (): Promise<Agent[]> => {
  return fetchWrapper(`${BASE_URL}/agents`);
};

export const getActiveAgents = async (): Promise<Agent[]> => {
  return fetchWrapper(`${BASE_URL}/agents/active`);
};

export const getAgentById = async (id: string): Promise<Agent> => {
  return fetchWrapper(`${BASE_URL}/agents/${id}`, {
    method: "GET",
  });
};

export const updateAgent = async (id: string, agentData: Partial<Agent>): Promise<{ message: string }> => {
  return fetchWrapper(`${BASE_URL}/agents/${id}`, {
    method: "PUT",
    body: JSON.stringify(agentData),
  });
};

export const deleteAgent = async (id: string): Promise<{ message: string }> => {
  return fetchWrapper(`${BASE_URL}/agents/${id}`, {
    method: "DELETE",
  });
};

export const deleteAllAgents = async (): Promise<{ message: string }> => {
  return fetchWrapper(`${BASE_URL}/agents`, {
    method: "DELETE",
  });
};

export const chatWithAgent = async (agentId: string, message: string, userId?: string): Promise<{ agentId: string; reply: string; task_id?: string; isTask?: boolean }> => {
  return fetchWrapper(`${BASE_URL}/chat/${agentId}`, {
    method: "POST",
    body: JSON.stringify({ message, userId }),
  });
};

export const chatWithAgentStream = (
  agentId: string,
  message: string,
  userId: string | undefined,
  onMessage: (content: string, task_id?: string, isTask?: boolean) => void,
  onDone: () => void
): Promise<void> => {
  return new Promise((resolve, reject) => {
    const API_KEY = import.meta.env.VITE_API_KEY || "your-default-api-key";

    fetch(`${BASE_URL}/chat/stream/${agentId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "text/event-stream",
        "X-API-Key": API_KEY,
      },
      body: JSON.stringify({ message, userId }),
    })
      .then((response) => {
        if (!response.ok) {
          return response.json().then((errorData) => {
            throw new Error(JSON.stringify({ status: response.status, ...errorData }));
          });
        }

        const reader = response.body?.getReader();
        if (!reader) {
          throw new Error("Response body not readable");
        }

        const decoder = new TextDecoder();
        let buffer = "";

        const processStream = async () => {
          while (true) {
            const { done, value } = await reader.read();
            if (done) {
              onDone();
              resolve();
              break;
            }

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n\n");

            for (let i = 0; i < lines.length - 1; i++) {
              const line = lines[i].trim();
              if (line.startsWith("data:")) {
                const dataStr = line.slice(5).trim();
                if (dataStr === "[DONE]") {
                  onDone();
                  resolve();
                  reader.cancel();
                  return;
                }
                try {
                  const data = JSON.parse(dataStr);
                  if (data.content) {
                    onMessage(data.content, data.task_id, data.isTask);
                  }
                } catch (e) {
                  console.error("Error parsing stream data:", e);
                }
              }
            }
            buffer = lines[lines.length - 1];
          }
        };

        processStream().catch((error) => {
          console.error("Stream processing error:", error);
          reject(error);
        });
      })
      .catch((error) => {
        console.error("Streaming error:", error);
        reject(error);
      });
  });
};

export const getTaskStatus = async (taskId: string): Promise<Task> => {
  return fetchWrapper(`${BASE_URL}/tasks/${taskId}/status`, {
    method: "GET",
  });
};