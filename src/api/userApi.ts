import { User } from '../interfaces/user';
import { fetchWrapper } from '../utils/fetchWrapper';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

export const createUser = async (userData: Omit<User, 'userId'>): Promise<User> => {
  return fetchWrapper(`${BASE_URL}/users`, {
    method: 'POST',
    body: JSON.stringify(userData),
    headers: { 'Content-Type': 'application/json' },
  });
};

// New endpoint to fetch user by Solana wallet address
export const getUserByWallet = async (solanaWalletAddress: string): Promise<User> => {
  return fetchWrapper(`${BASE_URL}/users/by-wallet/${solanaWalletAddress}`);
};

// Existing endpoints (unchanged)
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