"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import {
  User as FirebaseUser,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { auth } from "@/lib/firebase/config";
import { TenantUser } from "@/types/tenant";
import { usersService } from "@/services/users/usersService";

type AuthState = "loading" | "authenticated" | "unauthenticated";

interface AuthContextType {
  user: TenantUser | null;
  firebaseUser: FirebaseUser | null;
  authState: AuthState;
  needsOnboarding: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signUp: (email: string, password: string, nombre: string, apellido: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<TenantUser | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [authState, setAuthState] = useState<AuthState>("loading");
  const [needsOnboarding, setNeedsOnboarding] = useState(false);

  // Reload user data (without waiting for Rowy - user already exists)
  const reloadUserData = async (firebaseUser: FirebaseUser) => {
    try {
      // Get user data (this call already returns the user with tenants info)
      const userData = await usersService.getById(firebaseUser.uid);

      if (userData) {
        setUser(userData);

        // Check if user needs onboarding directly from userData (avoid extra call)
        const tenants = userData.tenants || {};
        const needsOb = Object.keys(tenants).length === 0;
        setNeedsOnboarding(needsOb);

        setAuthState("authenticated");
      } else {
        throw new Error("No se pudo cargar el usuario");
      }
    } catch (error) {
      console.error("Error reloading user data:", error);
      throw error;
    }
  };

  // Load user data (initial login - wait for Rowy extension)
  const loadUserData = async (firebaseUser: FirebaseUser) => {
    try {
      // Wait a bit for Rowy extension to create the user document
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Initialize user with tenant fields if needed
      await usersService.initializeUser(
        firebaseUser.uid,
        firebaseUser.email || "",
        firebaseUser.displayName || undefined
      );

      // Reload user data
      await reloadUserData(firebaseUser);
    } catch (error) {
      console.error("Error loading user data:", error);
      setAuthState("unauthenticated");
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setFirebaseUser(firebaseUser);
        await loadUserData(firebaseUser);
      } else {
        setFirebaseUser(null);
        setUser(null);
        setNeedsOnboarding(false);
        setAuthState("unauthenticated");
      }
    });

    return () => unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error("Error al iniciar sesión:", error);
      throw error;
    }
  };

  const signUp = async (email: string, password: string, nombre: string, apellido: string) => {
    try {
      // Rowy extension will create the user document automatically
      await createUserWithEmailAndPassword(auth, email, password);
      // loadUserData will be called by onAuthStateChanged
    } catch (error) {
      console.error("Error al registrarse:", error);
      throw error;
    }
  };

  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      // Rowy extension will create the user document automatically
      await signInWithPopup(auth, provider);
      // loadUserData will be called by onAuthStateChanged
    } catch (error) {
      console.error("Error al iniciar sesión con Google:", error);
      throw error;
    }
  };

  const refreshUser = async () => {
    if (firebaseUser) {
      await reloadUserData(firebaseUser);
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      throw error;
    }
  };

  const value = {
    user,
    firebaseUser,
    authState,
    needsOnboarding,
    signIn,
    signInWithGoogle,
    signUp,
    signOut,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth debe ser usado dentro de un AuthProvider");
  }
  return context;
}
