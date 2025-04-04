import { User } from '../interfaces/user';
import { Agent } from '../interfaces/agent';
import { fetchWrapper } from '../utils/fetchWrapper';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

// Interface for agent count response
interface AgentCountResponse {
  count: number;
}

// Interface for the response from getUserByWallet
interface GetUserByWalletResponse {
  user: User | null;
}

// Interface for the response from addUserCredits
interface AddCreditsResponse {
  message: string;
  newCreditBalance: number;
}

// Interface for server status response
interface ServerStatusResponse {
  isLive: boolean;
}

export const createUser = async (userData: Omit<User, 'userId'>): Promise<User> => {
  return fetchWrapper(`${BASE_URL}/users`, {
    method: 'POST',
    body: JSON.stringify(userData),
    headers: { 'Content-Type': 'application/json' },
  });
};

export const getUserByWallet = async (solanaWalletAddress: string): Promise<User | null> => {
  const response = await fetchWrapper<GetUserByWalletResponse>(`${BASE_URL}/users/by-wallet/${solanaWalletAddress}`);
  return response.user;
};

export const getUser = async (userId: string): Promise<User> => {
  return fetchWrapper(`${BASE_URL}/users/${userId}`);
};

export const getAllUsers = async (): Promise<User[]> => {
  return fetchWrapper(`${BASE_URL}/users`);
};

export const updateUser = async (userId: string, userData: Partial<User>): Promise<{ message: string }> => {
  return fetchWrapper(`${BASE_URL}/users/${userId}`, {
    method: 'PUT',
    body: JSON.stringify(userData),
    headers: { 'Content-Type': 'application/json' },
  });
};

export const getAgentCount = async (userId: string): Promise<number> => {
  const response = await fetchWrapper<AgentCountResponse>(`${BASE_URL}/users/${userId}/agents/count`, {
    method: "GET",
  });
  return response.count;
};

export const getActiveAgentCount = async (userId: string, isActive: boolean = true): Promise<number> => {
  const response = await fetchWrapper<AgentCountResponse>(
    `${BASE_URL}/users/${userId}/agents/active/count?isActive=${isActive}`,
    {
      method: "GET",
    }
  );
  return response.count;
};

export const getAgentsByUserId = async (userId: string, isActive?: boolean): Promise<Agent[]> => {
  const url = isActive !== undefined
    ? `${BASE_URL}/users/${userId}/agents?isActive=${isActive}`
    : `${BASE_URL}/users/${userId}/agents`;
  return fetchWrapper<Agent[]>(url, {
    method: "GET",
  });
};

export const deleteUser = async (userId: string): Promise<{ message: string }> => {
  return fetchWrapper(`${BASE_URL}/users/${userId}`, {
    method: 'DELETE',
  });
};

export const deleteAllUsers = async (): Promise<{ message: string }> => {
  return fetchWrapper(`${BASE_URL}/users`, {
    method: 'DELETE',
  });
};

export const addUserCredits = async (userId: string, txSignature: string, code: string): Promise<AddCreditsResponse> => {
  return fetchWrapper<AddCreditsResponse>(`${BASE_URL}/users/credits`, {
    method: 'POST',
    body: JSON.stringify({ userId, txSignature, code }),
    headers: { 'Content-Type': 'application/json' },
  });
};

// New function to check server status
export const getServerStatus = async (): Promise<ServerStatusResponse> => {
  return fetchWrapper<ServerStatusResponse>(`${BASE_URL}/status`, {
    method: 'GET',
  });
};