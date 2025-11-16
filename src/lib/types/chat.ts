export interface Chat {
  id: string;
  user1Id: string;
  user2Id: string;
  lastMessageAt?: string;
  lastMessagePreview?: string;
  lastMessageSenderId?: string;
  createdAt: string;
  updatedAt: string;
  user1?: ChatUser;
  user2?: ChatUser;
}

export interface ChatUser {
  id: string;
  name: string | null;
  username: string | null;
  profileImageUrl: string | null;
}

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  content: string;
  readAt?: string;
  createdAt: string;
  updatedAt: string;
  sender?: ChatUser;
}

export interface MessagesResponse {
  messages: Message[];
  nextCursor: string | null;
  hasMore: boolean;
}

export interface TypingUser {
  userId: string;
  isTyping: boolean;
}

export interface AvailableContact {
  id: string;
  name: string | null;
  username: string | null;
  profileImageUrl: string | null;
}
