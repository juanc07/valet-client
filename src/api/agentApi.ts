import { Agent } from '../interfaces/agent';
import { fetchWrapper } from '../utils/fetchWrapper';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

// CRUD operations for Agent
export const createAgent = async (agentData: Omit<Agent, 'id'>): Promise<Agent & { _id: string }> => {
  return fetchWrapper(`${BASE_URL}/agents`, {
    method: 'POST',
    body: JSON.stringify(agentData),
    headers: { 'Content-Type': 'application/json' },
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
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });
};

export const updateAgent = async (id: string, agentData: Partial<Agent>): Promise<{ message: string }> => {
  return fetchWrapper(`${BASE_URL}/agents/${id}`, {
    method: 'PUT',
    body: JSON.stringify(agentData),
    headers: { 'Content-Type': 'application/json' },
  });
};

export const deleteAgent = async (id: string): Promise<{ message: string }> => {
  return fetchWrapper(`${BASE_URL}/agents/${id}`, {
    method: 'DELETE',
  });
};

export const deleteAllAgents = async (): Promise<{ message: string }> => {
  return fetchWrapper(`${BASE_URL}/agents`, {
    method: 'DELETE',
  });
};

// Chat with Agent (Non-Streaming)
export const chatWithAgent = async (agentId: string, message: string): Promise<{ agentId: string; reply: string }> => {
  return fetchWrapper(`${BASE_URL}/chat/${agentId}`, {
    method: 'POST',
    body: JSON.stringify({ message }),
    headers: { 'Content-Type': 'application/json' },
  });
};

// Chat with Agent (Streaming)
export const chatWithAgentStream = async (
  agentId: string,
  message: string,
  onMessage: (content: string) => void,
  onDone: () => void
) => {
  try {
    const response = await fetch(`${BASE_URL}/chat/stream/${agentId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "text/event-stream",
      },
      body: JSON.stringify({ message }),      
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error("Response body not readable");
    }

    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        onDone();
        break;
      }

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");

      for (let i = 0; i < lines.length - 1; i++) {
        const line = lines[i].trim();
        if (line.startsWith("data:")) {
          const dataStr = line.slice(5).trim();
          if (dataStr === "[DONE]") {
            onDone();
            reader.cancel();
            return;
          }
          try {
            const data = JSON.parse(dataStr);
            if (data.content) {
              onMessage(data.content);
            }
          } catch (e) {
            console.error("Error parsing stream data:", e);
          }
        }
      }
      buffer = lines[lines.length - 1]; // Keep incomplete line in buffer
    }
  } catch (error) {
    console.error("Streaming error:", error);
    throw error; // Let the caller handle it
  }
};