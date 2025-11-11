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
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase/config";
import { User, UserRole } from "@/types";

type AuthState = "loading" | "authenticated" | "unauthenticated";

interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  authState: AuthState;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signUp: (email: string, password: string, nombre: string, apellido: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [authState, setAuthState] = useState<AuthState>("loading");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setFirebaseUser(firebaseUser);
        // Obtener datos del usuario desde Firestore
        const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data() as Omit<User, "id">;
          setUser({
            id: firebaseUser.uid,
            ...userData,
          });
          setAuthState("authenticated");
        } else {
          // Si no existe el documento, crear uno con rol por defecto
          const newUser: Omit<User, "id"> = {
            email: firebaseUser.email || "",
            nombre: "",
            apellido: "",
            rol: UserRole.USER,
            fechaCreacion: new Date(),
            fechaActualizacion: new Date(),
          };
          await setDoc(doc(db, "users", firebaseUser.uid), newUser);
          setUser({
            id: firebaseUser.uid,
            ...newUser,
          });
          setAuthState("authenticated");
        }
      } else {
        setFirebaseUser(null);
        setUser(null);
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
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const newUser: Omit<User, "id"> = {
        email,
        nombre,
        apellido,
        rol: UserRole.USER,
        fechaCreacion: new Date(),
        fechaActualizacion: new Date(),
      };
      await setDoc(doc(db, "users", userCredential.user.uid), newUser);
    } catch (error) {
      console.error("Error al registrarse:", error);
      throw error;
    }
  };

  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);

      // Verificar si el usuario ya existe en Firestore
      const userDoc = await getDoc(doc(db, "users", result.user.uid));

      if (!userDoc.exists()) {
        // Si es la primera vez que inicia sesión, crear el documento del usuario
        const displayNameParts = result.user.displayName?.split(" ") || ["", ""];
        const nombre = displayNameParts[0] || "";
        const apellido = displayNameParts.slice(1).join(" ") || "";

        const newUser: Omit<User, "id"> = {
          email: result.user.email || "",
          nombre,
          apellido,
          rol: UserRole.USER,
          fechaCreacion: new Date(),
          fechaActualizacion: new Date(),
        };
        await setDoc(doc(db, "users", result.user.uid), newUser);
      }
    } catch (error) {
      console.error("Error al iniciar sesión con Google:", error);
      throw error;
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
    signIn,
    signInWithGoogle,
    signUp,
    signOut,
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
