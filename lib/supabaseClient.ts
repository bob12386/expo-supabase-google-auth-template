import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";
import { AppState, Platform } from "react-native";
import 'react-native-get-random-values';
import 'react-native-url-polyfill/auto';

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

// Custom storage adapter that swallows errors (like missing window in SSR)
// Custom storage adapter using SecureStore
const ExpoStorage: {
    getItem: (key: string) => Promise<string | null>;
    setItem: (key: string, value: string) => Promise<void>;
    removeItem: (key: string) => Promise<void>;
} = {
    getItem: async (key: string) => {
        try {
            if (Platform.OS === 'web' && typeof window === 'undefined') {
                return null;
            }
            const value = await AsyncStorage.getItem(key);
            return value;
        } catch (e) {
            console.error('ExpoStorage getItem error:', e);
            return null;
        }
    },
    setItem: async (key: string, value: string) => {

        try {
            if (Platform.OS === 'web' && typeof window === 'undefined') {
                return;
            }
            await AsyncStorage.setItem(key, value);
        } catch (e) {
            console.error('ExpoStorage setItem error:', e);
        }
    },
    removeItem: async (key: string) => {
        try {
            if (Platform.OS === 'web' && typeof window === 'undefined') {
                return;
            }
            await AsyncStorage.removeItem(key);
        } catch (e) {
            console.error('ExpoStorage removeItem error:', e);
        }
    },
};

export const supabase = createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY,
    {
        auth: {
            storage: ExpoStorage,
            autoRefreshToken: true,
            persistSession: true,
            detectSessionInUrl: false,
            flowType: 'pkce',
            // No-op lock implementation to disable locking
            lock: (name, acquireTimeout, fn) => fn(),
            debug: false,
        },
    }
);

// Tells Supabase to auto-refresh the token only if the app is in the foreground
AppState.addEventListener('change', (state) => {
    if (state === 'active') {
        supabase.auth.startAutoRefresh()
    } else {
        supabase.auth.stopAutoRefresh()
    }
})
