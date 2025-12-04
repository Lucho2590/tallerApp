"use client";

import { FirebaseAppProvider, AuthProvider as ReactFireAuthProvider, FirestoreProvider } from "reactfire";
import { app, auth, db } from "@/lib/firebase/config";
import { AuthProvider } from "@/contexts/AuthContext";
import { TenantProvider } from "@/contexts/TenantContext";

export function FirebaseProviders({ children }: { children: React.ReactNode }) {
  return (
    <FirebaseAppProvider firebaseApp={app}>
      <ReactFireAuthProvider sdk={auth}>
        <FirestoreProvider sdk={db}>
          <AuthProvider>
            <TenantProvider>
              {children}
            </TenantProvider>
          </AuthProvider>
        </FirestoreProvider>
      </ReactFireAuthProvider>
    </FirebaseAppProvider>
  );
}
