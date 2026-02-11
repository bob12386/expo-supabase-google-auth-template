import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";
import { supabase } from "./supabaseClient";

/**
 * Initiates the Google OAuth sign-in flow.
 * Uses `expo-web-browser` to open the provider's auth page.
 * The session is finalized in `app/_layout.tsx` via `exchangeCodeForSession`.
 */
export const signInWithGoogle = async () => {
    try {
        // 1. Create the redirect URL.
        // For Expo Go: exp://...
        // For Production/Dev Client: onequestion://auth/callback
        const redirectUrl = Linking.createURL("auth/callback", { scheme: "authsetup" });

        console.log("[Auth] Starting Google Sign In...");
        console.log("[Auth] Redirect URL:", redirectUrl);

        // 2. Init OAuth with Supabase
        // We set skipBrowserRedirect: true because we handle the browser manually.
        // flowType: 'pkce' is default in newer supabase-js builds, but critical for mobile.
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: "google",
            options: {
                redirectTo: redirectUrl,
                skipBrowserRedirect: true,
            },
        });

        if (error) {
            console.error("[Auth] Supabase OAuth Error:", error);
            throw error;
        }

        if (!data?.url) {
            throw new Error("No auth URL returned from Supabase");
        }

        console.log("[Auth] Opening WebBrowser with URL:", data.url);

        // 3. Open the browser
        // logic: The browser will hit Supabase -> Google -> Supabase -> App Deep Link
        const result = await WebBrowser.openAuthSessionAsync(data.url, redirectUrl);

        console.log("[Auth] WebBrowser Result:", result);

        if (result.type === "success") {
            // Just return. The deep link listener in _layout.tsx will handle the session exchange.
            // Or if the deep link opens the app, this promise resolves.
            // However, on Android sometimes the browser just closes and the app comes to foreground via intent.
            console.log("[Auth] Browser flow success.");
        }

    } catch (error) {
        console.error("[Auth] signInWithGoogle Error:", error);
        // Optional: Show alert to user
    }
};

export const signOut = async () => {
    await supabase.auth.signOut();
};
