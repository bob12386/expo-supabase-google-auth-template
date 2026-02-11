import {
  Manrope_400Regular,
  Manrope_500Medium,
  Manrope_600SemiBold,
  Manrope_700Bold,
  Manrope_800ExtraBold,
  useFonts,
} from "@expo-google-fonts/manrope";
import * as Linking from "expo-linking";
import { router, Slot, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import * as WebBrowser from "expo-web-browser";
import { useEffect, useRef, useState } from "react";
import "react-native-get-random-values";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthProvider, useAuth } from "../context/AuthProvider";
import { initializeApplication } from "../lib/bootstrap";
import { KeyManager } from "../lib/keyManager";
import { supabase } from "../lib/supabaseClient"; // Corrected import


WebBrowser.maybeCompleteAuthSession();


import { AppBootstrap } from "../components/AppBootstrap";

function AppContent() {
  const { session, isLoading } = useAuth();
  const segments = useSegments();
  const [isHandlingAuth, setIsHandlingAuth] = useState(true);
  const hasHandledAuth = useRef(false);
  const [isBootstrapComplete, setIsBootstrapComplete] = useState(false);
  const [fontsLoaded] = useFonts({
    Manrope: Manrope_400Regular,
    Manrope_400Regular,
    Manrope_500Medium,
    Manrope_600SemiBold,
    Manrope_700Bold,
    Manrope_800ExtraBold,
  });

  const isReady = !isLoading && fontsLoaded && isBootstrapComplete;
  const hasBootstrapped = useRef(false);

  useEffect(() => {
    if (hasBootstrapped.current) return;
    hasBootstrapped.current = true;


    initializeApplication().finally(() => {
      setIsBootstrapComplete(true);
    });
  }, []);


  useEffect(() => {
    if (session?.user) {
      KeyManager.getOrCreateUserKey(session.user.id).catch((err) => {
        console.error("[LAYOUT] Key sync failed:", err);
      });
    }
  }, [session]);


  useEffect(() => {
    if (isReady && !isHandlingAuth) SplashScreen.hideAsync();
  }, [isReady, isHandlingAuth]);


  useEffect(() => {
    if (!session) {
      hasHandledAuth.current = false;
    }
  }, [session]);

  useEffect(() => {
    const handleDeepLink = async (url: string) => {
      if (hasHandledAuth.current) {
        return;
      }

      if (!url.includes("auth/callback")) {
        setIsHandlingAuth(false);
        return;
      }

      hasHandledAuth.current = true;
      setIsHandlingAuth(true);

      try {
        const params =
          url.includes("?")
            ? new URLSearchParams(url.split("?")[1])
            : new URLSearchParams(url.split("#")[1]);

        const code = params.get("code");
        const errorDescription = params.get("error_description");

        if (errorDescription) {
          console.error("[Layout] Auth provider error:", errorDescription);
          setIsHandlingAuth(false);
          router.replace("/onboarding" as any);
          return;
        }

        if (!code) {
          console.warn("[Layout] No code found in URL.");
          setIsHandlingAuth(false);
          router.replace("/onboarding" as any);
          return;
        }

        const { data, error } = await supabase.auth.exchangeCodeForSession(code);

        if (error) {
          console.error("[Layout] Exchange failed:", error);
          setIsHandlingAuth(false);
          router.replace("/onboarding" as any);
          return;
        }

        setTimeout(() => {
          setIsHandlingAuth(false);
          router.replace("/(tabs)");
        }, 500);
      } catch (err) {
        console.error("[Layout] Deep link processing error:", err);
        setIsHandlingAuth(false);
        router.replace("/onboarding" as any);
      }
    };

    const sub = Linking.addEventListener("url", (e) =>
      handleDeepLink(e.url)
    );

    Linking.getInitialURL().then((url) => {
      if (url) {
        handleDeepLink(url);
      } else {
        setIsHandlingAuth(false);
      }
    });

    return () => sub.remove();
  }, []);

  useEffect(() => {
    if (!isReady || isHandlingAuth) return;

    const root = segments[0];
    const inAuth = root === "(auth)";
    const inOnboarding = root === "onboarding";
    const inInternal = root === "(internal)";

    if (session && (inAuth || inOnboarding || inInternal)) {
      router.replace("/(tabs)");
    }

    if (!session && !inAuth && !inOnboarding && !inInternal) {
      router.replace("/onboarding" as any);
    }
  }, [session, isReady, segments, isHandlingAuth]);

  if (!isReady || isHandlingAuth) {
    return <AppBootstrap />;
  }


  return (
    <SafeAreaProvider>
      <Slot />
    </SafeAreaProvider>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
