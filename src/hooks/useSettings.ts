import { create } from "zustand";

export interface SettingsState {
  theme: "dark" | "light" | "system";
  defaultLayout: "HIERARCHICAL" | "HORIZONTAL" | "VERTICAL";
  showMinimap: boolean;
  showGrid: boolean;
  animatedEdges: boolean;
  autoSave: boolean;
  confirmDelete: boolean;
  updateSettings: (settings: Partial<SettingsState>) => void;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  theme: "dark",
  defaultLayout: "HIERARCHICAL",
  showMinimap: true,
  showGrid: true,
  animatedEdges: true,
  autoSave: true,
  confirmDelete: true,
  updateSettings: (newSettings) =>
    set((state) => ({ ...state, ...newSettings })),
}));
