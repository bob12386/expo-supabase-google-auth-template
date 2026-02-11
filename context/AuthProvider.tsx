import { Session } from "@supabase/supabase-js";
import { createContext, useContext, useEffect, useState } from "react";
import { signOut } from "../lib/auth";
// import { LocalCache } from "../lib/cache"; // TODO: Restore when cache.ts is available
import { supabase } from "../lib/supabaseClient";

interface AuthContextType {
    session: Session | null;
    isLoading: boolean;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    session: null,
    isLoading: true,
    signOut: async () => { },
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [session, setSession] = useState<Session | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let mounted = true;

        const initializeAuth = async () => {
            try {
                // 1. Try to load from Cache first (Decrypted)
                // Note: We might store session purely in Supabase storage, but if we want instant load 
                // we can also look at our LocalCache if we decided to duplicate it there.
                // However, Supabase's `persistSession` already handles AsyncStorage.
                // WE use LocalCache for *Domain Data* (Profile, Answers).
                // But let's check Supabase session.

                const { data: { session: initialSession }, error } = await supabase.auth.getSession();

                if (mounted) {
                    setSession(initialSession);
                    setIsLoading(false);
                }
            } catch (error) {
                console.error("Auth init success/fail:", error);
                if (mounted) setIsLoading(false);
            }
        };

        initializeAuth();

        // 2. Listen for Auth Changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
            if (mounted) {
                setSession(newSession);

                if (event === 'SIGNED_IN' && newSession) {
                    // Initialize or Refresh User Cache if needed
                    // For example, fetch profile and encrypt it into cache
                    // This creates the "Self-healing" cache
                }

                if (event === 'SIGNED_OUT') {
                    // Clear all encrypted local data
                    // await LocalCache.clearAll(); // TODO: Restore when cache.ts is available
                }
            }
        });

        return () => {
            mounted = false;
            subscription.unsubscribe();
        };
    }, []);

    const handleSignOut = async () => {
        try {
            await signOut();
        } catch (error) {
            console.error("SignOut error:", error);
        }
    };

    return (
        <AuthContext.Provider value={{ session, isLoading, signOut: handleSignOut }}>
            {children}
        </AuthContext.Provider>
    );
}
