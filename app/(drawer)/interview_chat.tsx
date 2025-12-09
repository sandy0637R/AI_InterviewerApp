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
  const [currentQNumber, setCurrentQNumber] = useState(1);

  useEffect(() => {
    const fetchResume = async () => {
      try {
        const res = await resumeInterview({ sessionId });
        if (res.success) {
          const previousMessages = res.answersSoFar.map((a: any) => ({
            questionNumber: a.questionNumber,
            text: a.answer,
            isUser: true,
          }));
          const currentQuestion = {
            questionNumber: res.questionNumber,
            text: res.question,
            isUser: false,
          };
          setMessages([...previousMessages, currentQuestion]);
          setCurrentQNumber(res.questionNumber);
        }
      } catch (err) {
        console.log(err);
        Alert.alert("Error", "Failed to resume interview");
      }
    };
    fetchResume();
  }, [sessionId]);

  const handleSend = async () => {
    if (!answer.trim()) return;

    setMessages((prev) => [...prev, { questionNumber: currentQNumber, text: answer, isUser: true }]);

    try {
      const res = await nextQuestion({ sessionId, answer });
      if (res.success) {
        if (res.completed) {
          setMessages((prev) => [
            ...prev,
            { questionNumber: "Feedback", text: res.feedback, isUser: false },
          ]);
        } else {
          setMessages((prev) => [
            ...prev,
            { questionNumber: res.questionNumber, text: res.question, isUser: false },
          ]);
          setCurrentQNumber(res.questionNumber);
        }
      } else if (res.askAgain) {
        setMessages((prev) => [
          ...prev,
          { questionNumber: currentQNumber, text: res.message, isUser: false },
        ]);
      }
    } catch (err) {
      console.log(err);
      Alert.alert("Error", "Server error");
    }

    setAnswer("");
  };

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
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Type your answer..."
            value={answer}
            onChangeText={setAnswer}
          />
          <Button title="Send" onPress={handleSend} />
        </View>
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
