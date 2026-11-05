import { create } from "zustand";
import type { FindingCategory, FindingStatus, Severity } from "../types";

interface UiState {
  // Modal states
  isLinkModalOpen: boolean;
  setLinkModalOpen: (open: boolean) => void;

  // PR review view states
  activeTab: "findings" | "diff";
  setActiveTab: (tab: "findings" | "diff") => void;

  // Finding filter states
  severityFilter?: Severity;
  setSeverityFilter: (severity?: Severity) => void;

  categoryFilter?: FindingCategory;
  setCategoryFilter: (category?: FindingCategory) => void;

  statusFilter?: FindingStatus;
  setStatusFilter: (status?: FindingStatus) => void;

  searchQuery: string;
  setSearchQuery: (query: string) => void;

  resetFilters: () => void;
}

export const useUiStore = create<UiState>((set) => ({
  isLinkModalOpen: false,
  setLinkModalOpen: (open) => set({ isLinkModalOpen: open }),

  activeTab: "findings",
  setActiveTab: (tab) => set({ activeTab: tab }),

  severityFilter: undefined,
  setSeverityFilter: (severity) => set({ severityFilter: severity }),

  categoryFilter: undefined,
  setCategoryFilter: (category) => set({ categoryFilter: category }),

  statusFilter: undefined,
  setStatusFilter: (status) => set({ statusFilter: status }),

  searchQuery: "",
  setSearchQuery: (query) => set({ searchQuery: query }),

  resetFilters: () =>
    set({
      severityFilter: undefined,
      categoryFilter: undefined,
      statusFilter: undefined,
      searchQuery: "",
    }),
}));
