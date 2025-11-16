import { http } from "../http";
import type { Chat, Message, MessagesResponse, AvailableContact } from "@/lib/types/chat";

export async function getChats(): Promise<Chat[]> {
  return http<Chat[]>("/chats");
}

export async function getChat(chatId: string): Promise<Chat> {
  return http<Chat>(`/chats/${chatId}`);
}

export async function findOrCreateChat(targetUserId: string): Promise<Chat> {
  return http<Chat>("/chats/find-or-create", {
    method: "POST",
    body: { targetUserId },
  });
}

export async function getMessages(
  chatId: string,
  cursor?: string,
  limit: number = 20
): Promise<MessagesResponse> {
  const params = new URLSearchParams({ limit: limit.toString() });
  if (cursor) params.append("cursor", cursor);
  return http<MessagesResponse>(`/chats/${chatId}/messages?${params}`);
}

export async function getNewMessages(chatId: string, since: string): Promise<Message[]> {
  return http<Message[]>(`/chats/${chatId}/messages/new?since=${since}`);
}

export async function sendMessage(chatId: string, content: string): Promise<Message> {
  return http<Message>(`/chats/${chatId}/messages`, {
    method: "POST",
    body: { content },
  });
}

export async function markAsRead(messageId: string): Promise<Message> {
  return http<Message>(`/chats/messages/${messageId}/read`, {
    method: "PATCH",
  });
}

export async function getUnreadCount(chatId: string): Promise<{ count: number }> {
  return http<{ count: number }>(`/chats/${chatId}/unread-count`);
}

export async function getAvailableContacts(): Promise<AvailableContact[]> {
  return http<AvailableContact[]>("/chats/available-contacts");
}
