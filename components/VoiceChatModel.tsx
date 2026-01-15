import React, { useEffect, useState, useRef } from "react";
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  SafeAreaView,
  StatusBar,
  Animated,
  Easing,
} from "react-native";
import { Colors } from "@/constants/colors";
import { useVoiceInterview } from "@/hooks/useVoiceInterview";
import { Ionicons } from "@expo/vector-icons";

interface VoiceChatModelProps {
  disabled?: boolean;
  onSend: (text: string) => void;
  currentQuestion?: string;
  aiName?: string;
  playTrigger?: number;
}

const VoiceChatModel: React.FC<VoiceChatModelProps> = ({
  disabled,
  onSend,
  currentQuestion,
  aiName = "Interviewer",
  playTrigger = 0,
}) => {
  const [visible, setVisible] = useState(false);
  const [sessionStarted, setSessionStarted] = useState(false);
  const [subtitles, setSubtitles] = useState("");

  // Logic: Transcript Ref
  const finalTranscriptRef = useRef("");

  // Animations
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rippleAnim = useRef(new Animated.Value(0)).current;

  const {
    isListening,
    isSpeaking,
    speak,
    stopSpeaking,
    startListening,
    stopListening,
  } = useVoiceInterview((text) => {
    setSubtitles(text);
    finalTranscriptRef.current = text;
  });

  // Animation Start/Stop Logic
  useEffect(() => {
    let pulseLoop: any = null;
    let rippleLoop: any = null;

    if (isListening || isSpeaking) {
      pulseLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 1000,
            useNativeDriver: true,
            easing: Easing.inOut(Easing.ease),
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
            easing: Easing.inOut(Easing.ease),
          }),
        ])
      );

      rippleLoop = Animated.loop(
        Animated.timing(rippleAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
          easing: Easing.out(Easing.ease),
        })
      );

      pulseLoop.start();
      rippleLoop.start();
    } else {
      // Reset values when idle
      pulseAnim.stopAnimation();
      rippleAnim.stopAnimation();
      pulseAnim.setValue(1);
      rippleAnim.setValue(0);
    }

    // Cleanup: Stop animations when effect re-runs or component unmounts
    return () => {
      pulseLoop?.stop();
      rippleLoop?.stop();
    };
  }, [isListening, isSpeaking]);

  // ---------------------------------------------------------
  // ORCHESTRATION (LOGIC UNCHANGED)
  // ---------------------------------------------------------
  useEffect(() => {
    if (visible && !sessionStarted) {
      setSessionStarted(true);
      const intro = `Hi, I am ${aiName}, your AI interviewer.`;
      speak(intro, {
        onDone: () => {
          if (currentQuestion) {
            speakQuestion(currentQuestion);
          } else {
            startListening();
          }
        }
      });
    }
  }, [visible, sessionStarted, aiName, currentQuestion, speak, startListening]);

  useEffect(() => {
    if (visible && sessionStarted && currentQuestion) {
      speakQuestion(currentQuestion);
    }
  }, [currentQuestion, playTrigger]);

  const speakQuestion = (text: string) => {
    setSubtitles(text);
    speak(text, {
      onDone: () => {
        setSubtitles("");
        finalTranscriptRef.current = "";
        setSubtitles("");
        startListening();
      },
    });
  };

  const wasListening = useRef(false);
  useEffect(() => {
    if (wasListening.current && !isListening) {
      const textToSend = finalTranscriptRef.current.trim();
      if (textToSend && visible) {
        onSend(textToSend);
        setSubtitles("Processing...");
        finalTranscriptRef.current = "";
      }
    }
    wasListening.current = isListening;
  }, [isListening, visible, onSend]);

  // ---------------------------------------------------------
  // HANDLERS
  // ---------------------------------------------------------
  const handleClose = () => {
    stopSpeaking();
    stopListening();
    setVisible(false);
    setSessionStarted(false);
  };

  const handleManualStop = () => {
    stopListening();
  };

  return (
    <>
      <TouchableOpacity
        disabled={disabled}
        onPress={() => setVisible(true)}
        style={styles.micButton}
      >
        <Ionicons name="mic" size={24} color={Colors.white} />
      </TouchableOpacity>

      <Modal visible={visible} animationType="fade" presentationStyle="overFullScreen" transparent={false}>
        <SafeAreaView style={styles.container}>
          <StatusBar barStyle="light-content" backgroundColor={Colors.background} />

          {/* HEADER */}
          <View style={styles.header}>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={Colors.textGray} />
            </TouchableOpacity>
          </View>

          {/* MAIN CONTENT */}
          <View style={styles.content}>

            {/* ANIMATED VISUALIZER */}
            <View style={styles.visualizerContainer}>
              {/* Ripple Effect */}
              {(isListening || isSpeaking) && (
                <Animated.View style={[
                  styles.ripple,
                  {
                    transform: [{ scale: rippleAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 2.5] }) }],
                    opacity: rippleAnim.interpolate({ inputRange: [0, 1], outputRange: [0.3, 0] })
                  }
                ]} />
              )}

              {/* Main Circle */}
              <Animated.View style={[
                styles.visualizerCircle,
                { transform: [{ scale: pulseAnim }] },
                isListening ? styles.listeningState : isSpeaking ? styles.speakingState : styles.idleState
              ]}>
                <Ionicons
                  name={isSpeaking ? "volume-high" : isListening ? "mic" : "ellipsis-horizontal"}
                  size={40}
                  color={Colors.background}
                />
              </Animated.View>
            </View>

            {/* STATUS TEXT */}
            <Text style={styles.statusText}>
              {isSpeaking ? "AI IS SPEAKING" : isListening ? "LISTENING..." : "THINKING"}
            </Text>

            {/* SUBTITLES */}
            <View style={styles.subtitleContainer}>
              <Text style={styles.subtitleText}>
                {subtitles || (isListening ? "..." : "")}
              </Text>
            </View>
          </View>

          {/* FOOTER */}
          <View style={styles.footer}>
            {isListening && (
              <TouchableOpacity onPress={handleManualStop} style={styles.actionButton}>
                <Ionicons name="checkmark" size={32} color={Colors.white} />
              </TouchableOpacity>
            )}
            <Text style={styles.footerHint}>
              {isListening ? "Tap to finish speaking" : "AI Interview Mode"}
            </Text>
          </View>
        </SafeAreaView>
      </Modal>
    </>
  );
};

export default VoiceChatModel;

const styles = StyleSheet.create({
  micButton: {
    padding: 12,
    backgroundColor: Colors.secondary, // Or use a nice blue if allowed
    borderRadius: 30,
    marginHorizontal: 8,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)"
  },
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: "row",
    justifyContent: "flex-end",
    padding: 24,
  },
  closeButton: {
    padding: 12,
    backgroundColor: Colors.primary,
    borderRadius: 50,
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
  },
  visualizerContainer: {
    height: 200,
    width: 200,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 50,
  },
  ripple: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.white,
    zIndex: -1
  },
  visualizerCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.white,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  idleState: {
    backgroundColor: Colors.textGray,
  },
  listeningState: {
    backgroundColor: Colors.white, // User active -> White
    borderColor: Colors.white,
    borderWidth: 2,
  },
  speakingState: {
    backgroundColor: "#FFD700", // AI Speaking -> Gold/Yellow glow
    shadowColor: "#FFD700",
  },
  statusText: {
    color: Colors.textGray,
    fontSize: 14,
    marginBottom: 30,
    textTransform: "uppercase",
    letterSpacing: 4,
    fontWeight: "600",
  },
  subtitleContainer: {
    minHeight: 80,
    justifyContent: "center",
    alignItems: "center",
  },
  subtitleText: {
    color: Colors.white,
    fontSize: 24,
    fontWeight: "500",
    textAlign: "center",
    lineHeight: 36,
  },
  footer: {
    padding: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  actionButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.primary, // Button background
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)"
  },
  footerHint: {
    color: Colors.textGray,
    fontSize: 12,
    opacity: 0.6
  }
});
