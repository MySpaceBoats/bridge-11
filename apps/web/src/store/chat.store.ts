import { create } from 'zustand';
import type { ChatGroup, Message } from '@/types';

interface ChatState {
  groups: ChatGroup[];
  activeGroupId: string | null;
  messages: Record<string, Message[]>;
  typingUsers: Record<string, string[]>;
  setGroups: (groups: ChatGroup[]) => void;
  setActiveGroup: (id: string) => void;
  setMessages: (groupId: string, messages: Message[]) => void;
  addMessage: (groupId: string, message: Message) => void;
  setTyping: (groupId: string, userId: string, isTyping: boolean) => void;
}

export const useChatStore = create<ChatState>((set) => ({
  groups: [],
  activeGroupId: null,
  messages: {},
  typingUsers: {},

  setGroups: (groups) => set({ groups }),

  setActiveGroup: (id) => set({ activeGroupId: id }),

  setMessages: (groupId, messages) =>
    set((s) => ({ messages: { ...s.messages, [groupId]: messages } })),

  addMessage: (groupId, message) =>
    set((s) => ({
      messages: {
        ...s.messages,
        [groupId]: [...(s.messages[groupId] ?? []), message],
      },
    })),

  setTyping: (groupId, userId, isTyping) =>
    set((s) => {
      const current = s.typingUsers[groupId] ?? [];
      const updated = isTyping
        ? [...new Set([...current, userId])]
        : current.filter((id) => id !== userId);
      return { typingUsers: { ...s.typingUsers, [groupId]: updated } };
    }),
}));
