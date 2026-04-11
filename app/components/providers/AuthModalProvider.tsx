"use client";

import {
  createContext, useContext, useState, useCallback,
  type ReactNode,
} from "react";

type AuthMode = "signIn" | "signUp";

interface AuthModalContextValue {
  isOpen:     boolean;
  mode:       AuthMode;
  openSignIn:  () => void;
  openSignUp:  () => void;
  switchMode:  () => void;
  close:       () => void;
}

const AuthModalContext = createContext<AuthModalContextValue | null>(null);

export function useAuthModal() {
  const ctx = useContext(AuthModalContext);
  if (!ctx) throw new Error("useAuthModal must be used inside AuthModalProvider");
  return ctx;
}

export default function AuthModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [mode,   setMode]   = useState<AuthMode>("signIn");

  const openSignIn = useCallback(() => { setMode("signIn"); setIsOpen(true);  }, []);
  const openSignUp = useCallback(() => { setMode("signUp"); setIsOpen(true);  }, []);
  const switchMode = useCallback(() => setMode((m) => m === "signIn" ? "signUp" : "signIn"), []);
  const close      = useCallback(() => setIsOpen(false), []);

  return (
    <AuthModalContext.Provider value={{ isOpen, mode, openSignIn, openSignUp, switchMode, close }}>
      {children}
    </AuthModalContext.Provider>
  );
}