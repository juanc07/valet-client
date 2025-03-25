// src/api/imageApi.ts
import { fetchWrapper } from '../utils/fetchWrapper';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

// Response types based on backend controller
interface UploadImageResponse {
  message: string;
  profileImageId: string;
  url: string;
}

interface GetImageResponse {
  profileImageId: string;
  url: string;
}

interface DeleteImageResponse {
  message: string;
}

// Upload a profile image for an agent
export const uploadProfileImage = async (
  agentId: string,
  imageFile: File
): Promise<UploadImageResponse> => {
  const formData = new FormData();
  formData.append('image', imageFile); // Match the field name expected by multer ('image')

  return fetchWrapper(`${BASE_URL}/images/${agentId}/profile-image`, {
    method: 'POST',
    body: formData,
    // No headers needed here; fetchWrapper adds X-API-Key, and FormData sets Content-Type
  });
};

// Get the profile image URL for an agent
export const getProfileImage = async (agentId: string): Promise<GetImageResponse> => {
  return fetchWrapper(`${BASE_URL}/images/${agentId}/profile-image`, {
    method: 'GET',
    // No Content-Type needed for GET requests
  });
};

// Delete the profile image for an agent
export const deleteProfileImage = async (agentId: string): Promise<DeleteImageResponse> => {
  return fetchWrapper(`${BASE_URL}/images/${agentId}/profile-image`, {
    method: 'DELETE',
  });
};