import { signInWithGoogle } from "@/lib/auth";
import { supabase } from "@/lib/supabaseClient";
import { useResponsive } from "@/lib/ui";
import { AntDesign, MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    AppState,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Background } from "../../components/Background";

// Listen to app state changes for Supabase auto-refresh
AppState.addEventListener("change", (state) => {
    if (state === "active") {
        supabase.auth.startAutoRefresh();
    } else {
        supabase.auth.stopAutoRefresh();
    }
});

export default function Auth() {
    const { spacing, font, radius } = useResponsive();
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    // 1️⃣ AUTO LOGIN CHECK
    useEffect(() => {
        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                // If session exists, immediately redirect
                setLoading(true);
                router.replace("/(tabs)");
            }
        };
        checkSession();
    }, []);

    // 2️⃣ SESSION LISTENER
    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_IN' && session) {
                router.replace("/(tabs)");
            }
        });
        return () => subscription.unsubscribe();
    }, []);

    const handleGoogleLogin = async () => {
        try {
            setLoading(true);
            setErrorMsg(null);

            await signInWithGoogle();

            // If success, the onAuthStateChange listener in useEffect will handle the redirect.
            // We keep loading=true to prevent UI flicker until redirect happens.

        } catch (error: any) {
            console.error("Google Login Error:", error);
            setErrorMsg(error.message || "Failed to sign in with Google");
            setLoading(false);
        }
    };

    const styles = StyleSheet.create({
        container: {
            flex: 1,
        },
        scrollContent: {
            flexGrow: 1,
            justifyContent: "center",
            paddingBottom: spacing(20),
            paddingHorizontal: spacing(24),
        },
        headerCenter: {
            marginBottom: spacing(48),
            alignItems: "center",
        },
        logoText: {
            color: "#0e121b", // dark:text-white handled via theme/context usually, hardcoded for now or use useColorScheme
            fontFamily: Platform.OS === 'ios' ? "System" : "Roboto", // Replace with font-display if available
            fontWeight: "800",
            fontSize: font(30),
            letterSpacing: -0.5,
        },
        logoUnderline: {
            marginTop: 8,
            height: 4,
            width: 32,
            backgroundColor: "#194cb3", // primary
            borderRadius: 999,
        },
        card: {
            width: "100%",
            backgroundColor: "#ffffff", // dark:bg-[#1c2433]
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.05,
            shadowRadius: 2,
            elevation: 2,
            borderWidth: 1,
            borderColor: "#f3f4f6", // border-gray-100
            borderRadius: radius(24),
            padding: spacing(32),
        },
        cardHeader: {
            marginBottom: spacing(32),
        },
        welcomeText: {
            color: "#0e121b",
            fontWeight: "700",
            textAlign: "center",
            fontSize: font(24),
        },
        subtitleText: {
            color: "#506795", // text-[#506795]
            textAlign: "center",
            marginTop: 8,
            fontSize: font(14),
        },
        errorContainer: {
            marginBottom: spacing(16),
            backgroundColor: "#fef2f2", // bg-red-50
            borderRadius: radius(8),
            padding: spacing(12),
        },
        errorText: {
            color: "#ef4444", // text-red-500
            textAlign: "center",
            fontSize: font(14),
        },
        buttonContainer: {
            gap: 16,
        },
        googleButton: {
            width: "100%",
            backgroundColor: "#ffffff", // dark:bg-[#111621]
            borderWidth: 1,
            borderColor: "#d1d8e6",
            borderRadius: radius(12),
            height: spacing(56),
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: 12,

        },
        googleButtonText: {
            fontWeight: "600",
            color: "#0e121b", // dark:text-white
            fontSize: font(16),
        },
        termsContainer: {
            marginTop: spacing(32),
            alignItems: "center",
        },
        termsText: {
            color: "#94a3b8", // text-[#94a3b8]
            textAlign: "center",
            paddingHorizontal: 16,
            fontSize: font(13),
        },
        footer: {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            opacity: 0.6,
            marginTop: spacing(40),
        },
        footerText: {
            fontWeight: "500",
            color: "#0e121b", // dark:text-white
            fontSize: font(13),
        },
    });

    return (
        <Background>
            <SafeAreaView style={styles.container}>
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.headerCenter}>
                        <Text style={styles.logoText}>One Question</Text>
                        <View style={styles.logoUnderline} />
                    </View>

                    <View style={styles.card}>
                        <View style={styles.cardHeader}>
                            <Text style={styles.welcomeText}>Welcome Back</Text>
                            <Text style={styles.subtitleText}>Sign in to continue your journey</Text>
                        </View>

                        {errorMsg && (
                            <View style={styles.errorContainer}>
                                <Text style={styles.errorText}>{errorMsg}</Text>
                            </View>
                        )}

                        <View style={styles.buttonContainer}>
                            <TouchableOpacity
                                onPress={handleGoogleLogin}
                                disabled={loading}
                                style={[styles.googleButton, loading && { opacity: 0.7 }]}
                                activeOpacity={0.9}
                            >
                                {loading ? (
                                    <ActivityIndicator color="#194cb3" />
                                ) : (
                                    <>
                                        <AntDesign name="google" size={font(24)} color="#194cb3" />
                                        <Text style={styles.googleButtonText}>Continue with Google</Text>
                                    </>
                                )}
                            </TouchableOpacity>
                        </View>

                        <View style={styles.termsContainer}>
                            <Text style={styles.termsText}>
                                By continuing, you agree to our Terms of Service and Privacy Policy.
                            </Text>
                        </View>
                    </View>

                    <View style={styles.footer}>
                        <MaterialIcons name="lock" size={font(14)} color={Platform.OS === 'ios' ? "#0e121b" : "#506795"} />
                        <Text style={styles.footerText}>Your reflections are private and encrypted</Text>
                    </View>
                </ScrollView>
            </SafeAreaView>
        </Background>
    );
}
