import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as chatApi from "@/lib/api/chat";
import type { Chat, Message } from "@/lib/types/chat";

export function useChats() {
  return useQuery({
    queryKey: ["chats"],
    queryFn: chatApi.getChats,
  });
}

export function useChat(chatId: string) {
  return useQuery({
    queryKey: ["chats", chatId],
    queryFn: () => chatApi.getChat(chatId),
    enabled: !!chatId,
  });
}

export function useMessages(chatId: string) {
  return useInfiniteQuery({
    queryKey: ["messages", chatId],
    queryFn: ({ pageParam }) => chatApi.getMessages(chatId, pageParam, 20),
    getNextPageParam: (lastPage) => lastPage.hasMore ? lastPage.nextCursor : undefined,
    initialPageParam: undefined as string | undefined,
    enabled: !!chatId,
  });
}

export function useSendMessage(chatId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (content: string) => chatApi.sendMessage(chatId, content),
    onSuccess: (newMessage) => {
      queryClient.setQueryData<any>(
        ["messages", chatId],
        (old: any) => {
          if (!old?.pages) return old;
          const pages = [...old.pages];
          if (pages[0]) {
            pages[0] = {
              ...pages[0],
              messages: [newMessage, ...pages[0].messages],
            };
          }
          return { ...old, pages };
        }
      );

      queryClient.setQueryData<Chat[]>(
        ["chats"],
        (old) => {
          if (!old) return old;
          return old.map((chat) =>
            chat.id === chatId
              ? {
                  ...chat,
                  lastMessageAt: newMessage.createdAt,
                  lastMessagePreview: newMessage.content.substring(0, 200),
                  lastMessageSenderId: newMessage.senderId,
                }
              : chat
          );
        }
      );
    },
  });
}

export function useMarkAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (messageId: string) => chatApi.markAsRead(messageId),
    onSuccess: (updatedMessage) => {
      queryClient.setQueryData<any>(
        ["messages", updatedMessage.chatId],
        (old: any) => {
          if (!old?.pages) return old;
          return {
            ...old,
            pages: old.pages.map((page: any) => ({
              ...page,
              messages: page.messages.map((msg: Message) =>
                msg.id === updatedMessage.id ? updatedMessage : msg
              ),
            })),
          };
        }
      );
    },
  });
}

export function useFindOrCreateChat() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (targetUserId: string) => chatApi.findOrCreateChat(targetUserId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chats"] });
    },
  });
}

export function useAvailableContacts() {
  return useQuery({
    queryKey: ["available-contacts"],
    queryFn: chatApi.getAvailableContacts,
  });
}
