import { create } from 'zustand';

export interface Route {
  from: string;
  to: string;
  date: string;
  maxWeight: number;
  itemTypes: string[];
}

interface RouteState {
  routes: Route[];
  addRoute: (route: Route) => void;
  removeRoute: (index: number) => void;
}

export const useRouteStore = create<RouteState>((set) => ({
  routes: [],
  addRoute: (route) => set((state) => ({ routes: [...state.routes, route] })),
  removeRoute: (index) => set((state) => ({ routes: state.routes.filter((_, i) => i !== index) })),
})); 