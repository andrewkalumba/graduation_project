import { Session, User } from "@supabase/supabase-js";

export interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<{
    data: any; error: any 
}>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  supabaseUrl: string;
  supabaseKey: string;
  setSupabaseCredentials: (url: string, key: string) => void;
  getUserDisplayName: () => string;
}