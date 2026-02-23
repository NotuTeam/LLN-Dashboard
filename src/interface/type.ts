/** @format */

import { ReactNode } from "react";

export interface GlobalState {
  hasLogin: boolean;
  user: any;
  token?: string;
  isLoading: boolean;
}

export interface GlobalActions {
  setAuth: (user: any | null, token: string) => void;
  setLoading: (loading: boolean) => void;
  setToken: (token: string) => void;
  logout: () => void;
  checkAuth: () => void;
}

export interface GlobalProviderProps {
  state: GlobalState;
  actions: GlobalActions;
}

export type Actions =
  | { type: "SET_AUTH"; payload: any | null }
  | { type: "SET_TOKEN"; payload: string }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "LOGOUT" };

export interface MenuItem {
  id: number;
  text: string;
  icon: any;
  href?: string;
  children?: MenuItem[];
}
