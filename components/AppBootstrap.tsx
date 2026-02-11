import { ActivityIndicator, StyleSheet, View } from "react-native";
import { ThemedText } from "./themed-text"; // Assuming this exists or use plain Text

export function AppBootstrap() {
    return (
        <View style={styles.container}>
            <ActivityIndicator size="large" />
            <ThemedText style={styles.text}>Initializing...</ThemedText>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#fff", // Or theme background
    },
    text: {
        marginTop: 20,
    }
});
