/** @format */
"use client";

import {
  ReactNode,
  useEffect,
  useContext,
  createContext,
  useReducer,
} from "react";

import { useRouter } from "next/navigation";

import {
  GlobalState,
  GlobalActions,
  GlobalProviderProps,
  Actions,
} from "@/interface/type";
import { LocalToken, LocalRefreshToken } from "./var";
import { cookies } from "@/lib/utils";
import AxiosClient from "./axios";

const initialState: GlobalState = {
  hasLogin: false,
  user: null,
  token: undefined,
  isLoading: true,
};

const GlobalContext = createContext<GlobalProviderProps | undefined>(undefined);

function globalReducer(state: GlobalState, action: Actions): GlobalState {
  switch (action.type) {
    case "SET_AUTH":
      return {
        ...state,
        hasLogin: !!action.payload.user,
        user: action.payload.user,
        token: action.payload.tokens?.access_token || state.token,
        isLoading: false,
      };
    case "SET_TOKEN":
      return {
        ...state,
        token: action.payload,
      };
    case "SET_LOADING":
      return {
        ...state,
        isLoading: action.payload,
      };
    case "LOGOUT":
      return {
        ...initialState,
        isLoading: false,
      };
    default:
      return state;
  }
}

export async function Middleware({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [state, dispatch] = useReducer(globalReducer, initialState);

  const actions: GlobalActions = {
    setAuth: (user: any | null, token: string) => {
      dispatch({ type: "SET_AUTH", payload: { user, token } });

      if (token) {
        AxiosClient.setTokens(token);
      }
    },

    setToken: (token: string) => {
      dispatch({ type: "SET_TOKEN", payload: token });
      AxiosClient.setTokens(token);
    },

    setLoading: (loading: boolean) => {
      dispatch({ type: "SET_LOADING", payload: loading });
    },

    logout: () => {
      dispatch({ type: "LOGOUT" });
      AxiosClient.clearTokens();

      if (typeof window !== "undefined") {
        localStorage.removeItem(LocalToken);
        localStorage.removeItem(LocalRefreshToken);
        cookies.remove(LocalToken);
        cookies.remove(LocalRefreshToken);
        router.push("/login");
      }
    },

    checkAuth: async (): Promise<boolean> => {
      try {
        actions.setLoading(true);

        if (!AxiosClient.isAuthenticated()) {
          actions.setLoading(false);
          return false;
        }

        const { data } = await AxiosClient.get("/auth/me");

        const { status, message, ...user } = data;

        if (status === 200 && user) {
          actions.setAuth(user, user.access_token);
          return true;
        }

        actions.logout();
        return false;
      } catch (error) {
        console.error("Auth check failed:", error);
        actions.logout();
        return false;
      } finally {
        actions.setLoading(false);
      }
    },
  };

  useEffect(() => {
    window.scrollTo(0, 0);

    // Check authentication on app load
    actions.checkAuth();
  }, []);

  return (
    <GlobalContext.Provider value={{ state, actions }}>
      {children}
    </GlobalContext.Provider>
  );
}

export function useGlobalState() {
  const context = useContext(GlobalContext);
  if (context === undefined) {
    throw new Error("useGlobalState must be used within a GlobalProvider");
  }
  return context;
}
