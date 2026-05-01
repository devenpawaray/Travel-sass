import { create } from 'zustand';

export interface AppEvent {
  id: string;
  tenant_id: string;
  event_type: string;
  payload: any;
  created_at: string;
}

interface SystemState {
  events: AppEvent[];
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  killSwitch: boolean;
  activeQuotes: number;
  pendingApprovals: number;
  
  // Actions
  setEvents: (events: AppEvent[]) => void;
  addEvent: (event: AppEvent) => void;
  setKillSwitch: (status: boolean) => void;
  setRiskLevel: (level: 'LOW' | 'MEDIUM' | 'HIGH') => void;
  updateStats: (stats: Partial<SystemState>) => void;
}

export const useSystemStore = create<SystemState>((set) => ({
  events: [],
  riskLevel: 'LOW',
  killSwitch: false,
  activeQuotes: 0,
  pendingApprovals: 0,

  setEvents: (events) => set({ events }),
  addEvent: (event) => set((state) => ({ 
    events: [event, ...state.events].slice(0, 100) // Keep last 100
  })),
  setKillSwitch: (killSwitch) => set({ killSwitch }),
  setRiskLevel: (riskLevel) => set({ riskLevel }),
  updateStats: (stats) => set((state) => ({ ...state, ...stats })),
}));
