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
import { nextQuestion, resumeInterview } from "../../api/interview";

interface Message {
  questionNumber: string | number;
  text: string;
  isUser?: boolean;
}

const InterviewChat: React.FC = () => {
  const params = useLocalSearchParams();
  const sessionId = params.sessionId as string;

  const [messages, setMessages] = useState<Message[]>([]);
  const [answer, setAnswer] = useState("");
  const [currentQNumber, setCurrentQNumber] = useState<number>(1);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // track API loading

  useEffect(() => {
    const fetchResume = async () => {
      try {
        const res = await resumeInterview({ sessionId });
        console.log("Resume API response:", res);

        const msgs: Message[] = [];

        if (res.success) {
          // Add previous answers
          if (res.answersSoFar && res.answersSoFar.length > 0) {
            res.answersSoFar.forEach((a: any) => {
              msgs.push({
                questionNumber: a.questionNumber ?? 0,
                text: a.answer ?? "",
                isUser: true,
              });
            });
          }

          // If session completed → add feedback
          if (res.completed) {
            if (res.feedback) {
              msgs.push({
                questionNumber: "Feedback",
                text: res.feedback,
                isUser: false,
              });
            }
            setIsCompleted(true);
          } else {
            // Session not completed → add next question or initialize for new session
            const nextQNum = res.questionNumber ?? 1;
            const nextQText = res.question ?? "Question 1";

            msgs.push({
              questionNumber: nextQNum,
              text: nextQText,
              isUser: false,
            });
            setCurrentQNumber(nextQNum);
          }
        } else {
          // API failed → initialize new session placeholder
          msgs.push({ questionNumber: 1, text: "Question 1", isUser: false });
          setCurrentQNumber(1);
        }

        setMessages(msgs);
      } catch (err) {
        console.log("Error resuming interview:", err);
        Alert.alert("Error", "Failed to resume interview");
      } finally {
        setIsLoading(false);
      }
    };

    fetchResume();
  }, [sessionId]);

  const handleSend = async () => {
    if (!answer.trim() || isCompleted) return;

    setMessages((prev) => [
      ...prev,
      { questionNumber: currentQNumber ?? 0, text: answer, isUser: true },
    ]);

    try {
      const res = await nextQuestion({ sessionId, answer });

      if (res.success) {
        if (res.completed) {
          setMessages((prev) => [
            ...prev,
            { questionNumber: "Feedback", text: res.feedback ?? "", isUser: false },
          ]);
          setIsCompleted(true);
        } else {
          setMessages((prev) => [
            ...prev,
            { questionNumber: res.questionNumber ?? 0, text: res.question ?? "", isUser: false },
          ]);
          setCurrentQNumber(res.questionNumber ?? 1);
        }
      } else if (res.askAgain) {
        setMessages((prev) => [
          ...prev,
          { questionNumber: currentQNumber ?? 0, text: res.message ?? "", isUser: false },
        ]);
      }
    } catch (err) {
      console.log(err);
      Alert.alert("Error", "Server error");
    }

    setAnswer("");
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
    >
      <View style={styles.container}>
        <FlatList
          data={messages}
          keyExtractor={(item, index) => `${item.questionNumber}-${index}`}
          renderItem={({ item }) => (
            <View style={[styles.message, item.isUser ? styles.user : styles.ai]}>
              <Text>{item.text}</Text>
            </View>
          )}
          contentContainerStyle={{ paddingBottom: 80 }}
        />

        {!isCompleted && (
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Type your answer..."
              value={answer}
              onChangeText={setAnswer}
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
  container: { flex: 1, padding: 10, paddingBottom: 100 },
  message: { marginVertical: 5, padding: 10, borderRadius: 5 },
  user: { alignSelf: "flex-end", backgroundColor: "#d1e7dd" },
  ai: { alignSelf: "flex-start", backgroundColor: "#f8d7da" },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 10,
    paddingBottom: 50,
    backgroundColor: "#fff",
  },
  input: { flex: 1, borderWidth: 1, borderColor: "#ccc", borderRadius: 5, padding: 10, marginRight: 5 },
});
