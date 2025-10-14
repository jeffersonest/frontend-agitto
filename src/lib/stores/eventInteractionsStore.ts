import { create } from 'zustand';

export interface UserInteraction {
  isGoing: boolean;
  isInterested: boolean;
  isLiked: boolean;
  isOwner: boolean;
}

interface EventInteractionsState {
  interactions: Record<string, UserInteraction>;
  setInteraction: (eventId: string, interaction: UserInteraction) => void;
  setInteractions: (events: Array<{ id: string; userInteraction?: UserInteraction }>) => void;
  updateInteraction: (eventId: string, updates: Partial<UserInteraction>) => void;
  clearInteractions: () => void;
}

export const useEventInteractions = create<EventInteractionsState>((set) => ({
  interactions: {},

  setInteraction: (eventId, interaction) =>
    set((state) => ({
      interactions: {
        ...state.interactions,
        [eventId]: interaction,
      },
    })),

  setInteractions: (events) =>
    set((state) => {
      const newInteractions = { ...state.interactions };
      events.forEach((event) => {
        if (event.userInteraction) {
          newInteractions[event.id] = event.userInteraction;
        }
      });
      return { interactions: newInteractions };
    }),

  updateInteraction: (eventId, updates) =>
    set((state) => ({
      interactions: {
        ...state.interactions,
        [eventId]: {
          ...(state.interactions[eventId] || {
            isGoing: false,
            isInterested: false,
            isLiked: false,
            isOwner: false,
          }),
          ...updates,
        },
      },
    })),

  clearInteractions: () => set({ interactions: {} }),
}));
