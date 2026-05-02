export type AIModel = 'gemini' | 'gpt4' | 'claude';
export type ToolType = 'chat' | 'image' | 'code' | 'video';

export interface Message {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: number;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  subscription: 'free' | 'basic' | 'pro' | 'premium';
  tokensUsed: number;
}
