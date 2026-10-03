import { create } from "zustand";
import type { TabId } from "../types";

interface AppState {
  activeTab: TabId;
  authModalOpen: boolean;
  authMode: "login" | "register";
  /** True when user went through Steam auth via the app and should see the back arrow. */
  pendingReturnTo: boolean;
  setActiveTab: (tab: TabId) => void;
  openAuthModal: (mode?: "login" | "register") => void;
  closeAuthModal: () => void;
  setAuthModalOpen: (v: boolean) => void;
  setPendingReturnTo: (v: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  activeTab: "dashboard",
  authModalOpen: false,
  authMode: "login",
  pendingReturnTo: false,
  setActiveTab: (tab: TabId) => set({ activeTab: tab }),
  openAuthModal: (mode = "login") =>
    set({ authModalOpen: true, authMode: mode }),
  closeAuthModal: () => set({ authModalOpen: false }),
  setAuthModalOpen: (v) => set({ authModalOpen: v }),
  setPendingReturnTo: (v) => set({ pendingReturnTo: v }),
}));
