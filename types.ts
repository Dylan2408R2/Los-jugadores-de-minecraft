export interface User {
  username: string;
  avatar: string;
}

export interface Channel {
  id: string;
  name: string;
  description: string;
  type: 'public' | 'private';
}

export interface Message {
  id: string;
  text: string;
  sender: string;
  isUser: boolean;
  timestamp: Date;
  channelId: string;
  isTyping?: boolean;
  avatar?: string;
}

export enum AppState {
  LOGIN,
  CHAT
}