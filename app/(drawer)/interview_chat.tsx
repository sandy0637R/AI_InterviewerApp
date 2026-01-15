import Mybutton from "@/components/Mybutton";
import { Colors } from "@/constants/colors";
import { useLocalSearchParams, router } from "expo-router";
import React, { useEffect, useState } from "react";
import VoiceChatModel from "@/components/VoiceChatModel";

import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import type { InterviewSessionResponse } from "../../api/interview";
import { nextQuestion, resumeInterview } from "../../api/interview";

interface Message {
  id: string;
  text: string;
  isUser: boolean;
}

const InterviewChat: React.FC = () => {
  const { sessionId, id } = useLocalSearchParams<{
    sessionId?: string;
    id?: string;
  }>();
  // ... existing code ...
  const flatListRef = React.useRef<FlatList>(null);
  // ... existing code ...

  const activeSessionId = sessionId ?? id;

  const [messages, setMessages] = useState<Message[]>([]);
  const [answer, setAnswer] = useState("");
  const [isCompleted, setIsCompleted] = useState(false);
  const [currentQNumber, setCurrentQNumber] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  const [playTrigger, setPlayTrigger] = useState(0);

  const canAnswer = !isCompleted;

  useEffect(() => {
    if (!activeSessionId) return;

    const loadSession = async () => {
      try {
        const res: InterviewSessionResponse = await resumeInterview({
          sessionId: activeSessionId,
        });

        if (!res.success) {
          Alert.alert("Error", "Failed to load session");
          return;
        }

        const { session } = res;
        const msgs: Message[] = [];

        // ------------------ ADD GREETING IF NEW SESSION ------------------
        if (session.questionsAsked === 0 && !session.isCompleted) {
          msgs.push({
            id: "greeting",
            isUser: false,
            text: `Hello! Welcome to your interview for the role: ${session.role}. Let's start by getting to know you a bit before the questions begin.`,
          });
        }
        // -----------------------------------------------------------------

        session.answers.forEach((a) => {
          msgs.push({
            id: `q-${a.questionNumber}`,
            text: a.question,
            isUser: false,
          });

          msgs.push({
            id: `a-${a.questionNumber}`,
            text: a.answer,
            isUser: true,
          });
        });

        if (session.isCompleted && session.feedback) {
          const f = session.feedback;

          msgs.push({
            id: "feedback",
            isUser: false,
            text: `Rating: ${f.rating}/10

Plus Points:
${f.plusPoints.length ? f.plusPoints.map((p) => `• ${p}`).join("\n") : "• None"}

Areas to Improve:
${f.improvements.map((p) => `• ${p}`).join("\n")}

Summary:
${f.summary}`,
          });

          setIsCompleted(true);
        } else if (!session.isCompleted && session.lastQuestion) {
          msgs.push({
            id: "current-question",
            text: session.lastQuestion,
            isUser: false,
          });

          setCurrentQNumber(session.questionsAsked + 1);
          setIsCompleted(false);
        }

        setMessages(msgs);
      } catch (err: any) {
        console.error("Resume error:", err);
        if (err.response?.status === 404) {
          Alert.alert("Session Expired", "This interview session is no longer valid. Please start a new one.", [
            { text: "OK", onPress: () => router.replace("/(drawer)") }
          ]);
        } else {
          Alert.alert("Error", "Unable to resume interview");
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadSession();
  }, [activeSessionId]);

  const handleSend = async () => {
    if (!answer.trim() || !canAnswer || !activeSessionId) return;

    setMessages((prev) => [
      ...prev,
      {
        id: `user-${Date.now()}`,
        text: answer,
        isUser: true,
      },
    ]);

    try {
      const res = await nextQuestion({
        sessionId: activeSessionId,
        answer,
      });

      if (res.success && res.completed && res.feedback) {
        const f = res.feedback;

        setMessages((prev) => [
          ...prev,
          {
            id: "feedback",
            isUser: false,
            text: `Rating: ${f.rating}/10

Plus Points:
${f.plusPoints.length ? f.plusPoints.map((p: string) => `• ${p}`).join("\n") : "• None"}

Areas to Improve:
${f.improvements.map((p: string) => `• ${p}`).join("\n")}

Summary:
${f.summary}`,
          },
        ]);

        setIsCompleted(true);
      } else if (res.success && res.question) {
        setMessages((prev) => [
          ...prev,
          {
            id: `q-${res.questionNumber}`,
            text: res.question,
            isUser: false,
          },
        ]);

        setCurrentQNumber(res.questionNumber);
      } else if (res.askAgain) {
        setMessages((prev) => [
          ...prev,
          {
            id: `repeat-${Date.now()}`,
            text: res.message,
            isUser: false,
          },
        ]);
      }
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Server error");
    }

    setAnswer("");
  };
  const handleSendVoice = async (spokenText: string) => {
    setMessages((prev) => [
      ...prev,
      { id: `user-${Date.now()}`, text: spokenText, isUser: true },
    ]);

    try {
      const res = await nextQuestion({
        sessionId: activeSessionId!,
        answer: spokenText,
      });

      // 1. Success + Completed + Feedback
      if (res.success && res.completed && res.feedback) {
        const f = res.feedback;

        setMessages((prev) => [
          ...prev,
          {
            id: "feedback",
            isUser: false,
            text: `Rating: ${f.rating}/10

Plus Points:
${f.plusPoints.length ? f.plusPoints.map((p: string) => `• ${p}`).join("\n") : "• None"}

Areas to Improve:
${f.improvements.map((p: string) => `• ${p}`).join("\n")}

Summary:
${f.summary}`,
          },
        ]);
        setIsCompleted(true);
      }
      // 2. Success + Next Question
      else if (res.success && res.question) {
        setMessages((prev) => [
          ...prev,
          { id: `q-${res.questionNumber}`, text: res.question, isUser: false },
        ]);
        setCurrentQNumber(res.questionNumber);
      }
      // 3. Ask Again (Irrelevant Answer)
      else if (res.askAgain) {
        setMessages((prev) => [
          ...prev,
          {
            id: `repeat-${Date.now()}`,
            text: res.message, // "Your answer doesn't match..."
            isUser: false,
          },
        ]);
      }
      // 4. Repeat Question (User asked "Can you repeat?")
      else if (res.repeat) {
        // REPLAY LOGIC: Do NOT render a new bubble. Just force speech replay.
        setPlayTrigger(prev => prev + 1);
      }
    } catch {
      Alert.alert("Error", "Server error");
    }
  };


  if (isLoading) {
    return (
      <View style={styles.center}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
    >
      <View style={styles.container}>
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
          renderItem={({ item }) => (
            <View
              style={[
                styles.message,
                item.isUser ? styles.user : styles.ai,
                item.id === "feedback" && styles.feedbackMessage,
              ]}
            >
              {item.id === "feedback" && (
                <Text style={{
                  color: "#FFD700",
                  fontSize: 22,
                  fontWeight: "bold",
                  marginBottom: 16,
                  textAlign: "center",
                  textShadowColor: "rgba(255, 215, 0, 0.3)",
                  textShadowOffset: { width: 0, height: 0 },
                  textShadowRadius: 10
                }}>
                  🎉 PERFORMANCE RESULT
                </Text>
              )}
              <Text
                style={[
                  styles.text,
                  item.id === "feedback" && styles.feedbackText,
                ]}
              >
                {item.text}
              </Text>
            </View>
          )}
          keyboardShouldPersistTaps="handled"
        />

        {canAnswer && (
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Type your answer..."
              placeholderTextColor={Colors.secondary}
              value={answer}
              onChangeText={setAnswer}
              editable={canAnswer}
              multiline
              textAlignVertical="top"
            />
            <Mybutton title={"Send"} onPress={handleSend} />
            <VoiceChatModel
              disabled={!canAnswer}
              onSend={handleSendVoice}
              currentQuestion={messages.slice().reverse().find(m => !m.isUser)?.text || ""}
              aiName="Sarah"
              playTrigger={playTrigger}
            />
          </View>
        )}
      </View>
    </KeyboardAvoidingView>
  );
};

export default InterviewChat;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 20,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.background
  },

  // Bubbles
  message: {
    marginVertical: 8,
    padding: 16,
    borderRadius: 20,
    maxWidth: "85%",
  },
  user: {
    alignSelf: "flex-end",
    backgroundColor: "#2563EB", // A nice professional blue for user
    borderBottomRightRadius: 4,
  },
  ai: {
    alignSelf: "flex-start",
    backgroundColor: Colors.primary,
    borderBottomLeftRadius: 4,
  },
  text: {
    color: Colors.white,
    fontSize: 16,
    lineHeight: 24,
  },

  // Achievement Feedback
  feedbackMessage: {
    alignSelf: "stretch", // Full width
    backgroundColor: "#1c1c1c",
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#FFD700", // Gold border
    padding: 24,
    marginVertical: 24,
    shadowColor: "#FFD700",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 6, // Android glow
    alignItems: "center",
  },
  feedbackText: {
    color: Colors.white,
    fontSize: 16,
    lineHeight: 24,
    textAlign: "left", // Keep content readable
    width: "100%",
  },

  // Input Area
  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-end", // Align bottom for multiline
    paddingVertical: 10,
    marginBottom: 70,
    backgroundColor: Colors.background, // Match bg to hide scrolling content behind
  },
  input: {
    flex: 1,
    minHeight: 50,
    maxHeight: 120,
    backgroundColor: Colors.primary,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: Colors.border,
    color: Colors.white,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 12,
    marginRight: 10,
    fontSize: 16,
  },
});
