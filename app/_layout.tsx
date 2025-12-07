import { Stack } from 'expo-router';
import "expo-router/entry";
export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="(drawer)" options={{ headerShown: false }} />
      <Stack.Screen name="InterviewChat" options={{ title: "AI Interviewer" }} />
    </Stack>
  );
}
