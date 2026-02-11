import { Link } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

export default function Onboarding() {
    return (
        <View style={styles.container}>
            <Text style={styles.text}>Onboarding Screen (Stub)</Text>
            <Link href="/(auth)/login" style={styles.link}>Go to Login</Link>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    text: {
        fontSize: 20,
        marginBottom: 20,
    },
    link: {
        fontSize: 18,
        color: "blue",
    },
});
