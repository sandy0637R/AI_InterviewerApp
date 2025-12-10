// app/(drawer)/session/[id].tsx
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";

export default function SessionWrapper() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  React.useEffect(() => {
    console.log("🟦 SessionWrapper mounted. Param id =", id);

    if (!id) {
      console.log("❌ No session id. Redirecting to home...");
      router.replace("/");
    } else {
      console.log("➡️ Redirecting to interview_chat with session:", id);
      router.replace({ pathname: "/interview_chat", params: { sessionId: id } });
    }
  }, [id]);

  return null;
}
