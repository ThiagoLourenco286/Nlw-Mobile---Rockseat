import { Stack } from "expo-router";
import { colors } from "@/styles/theme";
import { useFonts, Rubik_600SemiBold, Rubik_400Regular, Rubik_500Medium, Rubik_700Bold } from "@expo-google-fonts/rubik";
import { Loading } from "@/components/loading";
import { GestureHandlerRootView } from "react-native-gesture-handler";

export default function Layout() {

    const [fontsLouded] = useFonts({
        Rubik_600SemiBold, Rubik_400Regular, Rubik_500Medium, Rubik_700Bold
    })

    if (!fontsLouded) {
        return <Loading />
    }

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.gray[100] } }}></Stack>
        </GestureHandlerRootView>
    )
}