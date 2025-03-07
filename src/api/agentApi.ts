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
export const chatWithAgentStream = (agentId: string, message: string, onMessage: (content: string) => void, onDone: () => void) => {
  const eventSource = new EventSource(`${BASE_URL}/chat/stream/${agentId}`, {
    withCredentials: true, // If you add auth later
  });

  eventSource.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data === '[DONE]') {
      onDone();
      eventSource.close();
    } else {
      onMessage(data.content);
    }
  };

  eventSource.onerror = (error) => {
    console.error('Streaming error:', error);
    eventSource.close();
  };

  // Send the message in a separate POST request (since your endpoint expects POST)
  fetchWrapper(`${BASE_URL}/chat/stream/${agentId}`, {
    method: 'POST',
    body: JSON.stringify({ message }),
    headers: { 'Content-Type': 'application/json' },
  }).catch((error) => {
    console.error('Error initiating stream:', error);
    eventSource.close();
  });

  return () => eventSource.close(); // Cleanup function
};