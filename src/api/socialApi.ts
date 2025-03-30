// socialApi.ts
import { fetchWrapper } from '../utils/fetchWrapper';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

export const postTweetManually = async (agentId: string, message?: string): Promise<{ message: string; tweetedMessage: string }> => {
  return fetchWrapper(`${BASE_URL}/twitter/${agentId}/tweet`, {
    method: 'POST',
    body: JSON.stringify({ message }),
    headers: { 'Content-Type': 'application/json' },
  });
};

export const requestTwitterOAuth = async (agentId: string): Promise<{ redirectUrl: string }> => {
  return fetchWrapper(`${BASE_URL}/twitter/oauth/request`, {
    method: 'POST',
    credentials: 'include',
    body: JSON.stringify({ agentId }),
    headers: { 'Content-Type': 'application/json' },
  });
};

export const sendTelegramMessage = async (agentId: string, chatId: string, message: string): Promise<{ message: string }> => {
  return fetchWrapper(`${BASE_URL}/telegram/${agentId}/send`, {
    method: 'POST',
    body: JSON.stringify({ chatId, message }),
    headers: { 'Content-Type': 'application/json' },
  });
};