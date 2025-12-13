import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Button,
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
  const { sessionId } = useLocalSearchParams<{ sessionId: string }>();

  const [messages, setMessages] = useState<Message[]>([]);
  const [answer, setAnswer] = useState("");
  const [isCompleted, setIsCompleted] = useState(false);
  const [currentQNumber, setCurrentQNumber] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  const canAnswer = !isCompleted;

  useEffect(() => {
    if (!sessionId) return;

    const loadSession = async () => {
      try {
        const res: InterviewSessionResponse = await resumeInterview({
          sessionId,
        });

        if (!res.success) {
          Alert.alert("Error", "Failed to load session");
          return;
        }

        const { session } = res;
        const msgs: Message[] = [];

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
      } catch (err) {
        console.error("Resume error:", err);
        Alert.alert("Error", "Unable to resume interview");
      } finally {
        setIsLoading(false);
      }
    };

    loadSession();
  }, [sessionId]);

  const handleSend = async () => {
    if (!answer.trim() || !canAnswer || !sessionId) return;

    setMessages((prev) => [
      ...prev,
      {
        id: `user-${Date.now()}`,
        text: answer,
        isUser: true,
      },
    ]);

    try {
      const res = await nextQuestion({ sessionId, answer });

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
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View
              style={[
                styles.message,
                item.isUser ? styles.user : styles.ai,
              ]}
            >
              <Text>{item.text}</Text>
            </View>
          )}
          keyboardShouldPersistTaps="handled"
        />

        {canAnswer && (
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Type your answer..."
              value={answer}
              onChangeText={setAnswer}
              editable={canAnswer}
            />
            <Button title="Send" onPress={handleSend} />
          </View>
        )}
      </View>
    </KeyboardAvoidingView>
  );
};

export default InterviewChat;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  message: { marginVertical: 6, padding: 10, borderRadius: 6 },
  user: { alignSelf: "flex-end", backgroundColor: "#d1e7dd" },
  ai: { alignSelf: "flex-start", backgroundColor: "#f8d7da" },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    paddingBottom:20,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderColor: "#eee",
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    marginRight: 5,
  },
});