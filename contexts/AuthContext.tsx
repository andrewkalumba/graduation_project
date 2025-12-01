"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { createClient, User, Session } from "@supabase/supabase-js";
import { AuthContextType } from "@/types/authContext";


const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [supabaseUrl, setSupabaseUrl] = useState("");
  const [supabaseKey, setSupabaseKey] = useState("");
  const [supabaseClient, setSupabaseClient] = useState<any>(null);

  // Load credentials from localStorage on mount
  useEffect(() => {
    const savedUrl = localStorage.getItem("visubase_url");
    const savedKey = localStorage.getItem("visubase_key");

    if (savedUrl && savedKey) {
      setSupabaseUrl(savedUrl);
      setSupabaseKey(savedKey);
    }

    setLoading(false);
  }, []);

  // Create Supabase client when credentials change
  useEffect(() => {
    if (supabaseUrl && supabaseKey) {
      const client = createClient(supabaseUrl, supabaseKey);
      setSupabaseClient(client);

      // Get initial session
      client.auth.getSession().then(({ data: { session } }) => {
        setSession(session);
        setUser(session?.user ?? null);
      });

      // Listen for auth changes
      const {
        data: { subscription },
      } = client.auth.onAuthStateChange((_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
      });

      return () => subscription.unsubscribe();
    }
  }, [supabaseUrl, supabaseKey]);

  const setSupabaseCredentials = (url: string, key: string) => {
    setSupabaseUrl(url);
    setSupabaseKey(key);
    localStorage.setItem("visubase_url", url);
    localStorage.setItem("visubase_key", key);
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    if (!supabaseClient) {
      return { error: { message: "Please configure Supabase credentials first" } };
    }

    const { data, error } = await supabaseClient.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: undefined,
        data: {
          full_name: fullName,
        },
      },
    });

    // Auto-confirm the user by signing them in immediately
    if (!error && data.user) {
      // Sign in immediately after signup (no email verification required)
      const { error: signInError } = await supabaseClient.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        return { error: signInError };
      }
    }

    return { error };
  };

  const signIn = async (email: string, password: string) => {
    if (!supabaseClient) {
      return { error: { message: "Please configure Supabase credentials first" } };
    }

    const { data, error } = await supabaseClient.auth.signInWithPassword({
      email,
      password,
    });

    return { error };
  };

  const signOut = async () => {
    if (!supabaseClient) return;
    await supabaseClient.auth.signOut();
  };

  const getUserDisplayName = (): string => {
    if (!user) return "";

    // Try to get full name from user metadata
    const fullName = user.user_metadata?.full_name;
    if (fullName) return fullName;

    // Fallback to email without domain
    if (user.email) {
      return user.email.split("@")[0];
    }

    return "User";
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        signUp,
        signIn,
        signOut,
        supabaseUrl,
        supabaseKey,
        setSupabaseCredentials,
        getUserDisplayName,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
