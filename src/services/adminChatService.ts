import { Message } from '../types';

export const getAdminResponse = async (message: string, history: Message[]): Promise<string> => {
  try {
    const response = await fetch('/api/admin/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message, history }),
    });

    if (!response.ok) {
      throw new Error('Admin chat request failed');
    }

    const data = await response.json();
    return data.response;
  } catch (error) {
    console.error('Error getting admin response:', error);
    return 'Admin command failed to execute. The backend service may be unavailable or you may lack permissions.';
  }
};
