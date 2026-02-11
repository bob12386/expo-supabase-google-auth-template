import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet, View, ViewProps, useColorScheme } from "react-native";

interface BackgroundProps extends ViewProps {
    children?: React.ReactNode;
}

export function Background({ children, style, ...props }: BackgroundProps) {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    return (
        <View style={[styles.container, isDark && styles.containerDark, style]} {...props}>
            {/* Background Gradient */}
            {isDark ? (
                <LinearGradient
                    colors={["#1a1f2e", "#111621"]}
                    style={StyleSheet.absoluteFill}
                />
            ) : (
                <LinearGradient
                    colors={["#eef2f7", "#f6f6f8"]}
                    style={StyleSheet.absoluteFill}
                />
            )}

            {/* Decorative Blobs */}
            <View style={styles.blobTop} />
            <View style={styles.blobBottom} />

            {children}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#eef2f7",
    },
    containerDark: {
        backgroundColor: "#1a1f2e",
    },
    blobTop: {
        position: "absolute",
        top: "-10%",
        right: "-10%",
        width: 256,
        height: 256,
        borderRadius: 999,
        backgroundColor: "#194cb3",
        opacity: 0.05,
    },
    blobBottom: {
        position: "absolute",
        bottom: "20%",
        left: "-10%",
        width: 192,
        height: 192,
        borderRadius: 999,
        backgroundColor: "#60a5fa",
        opacity: 0.05,
    },
});
