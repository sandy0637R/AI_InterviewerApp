import { useState, useCallback, useEffect, useRef } from "react";
import * as Speech from "expo-speech";
import { ExpoSpeechRecognitionModule, useSpeechRecognitionEvent } from "expo-speech-recognition";
import { Alert, Platform } from "react-native";

export const useVoiceInterview = (onTranscript: (text: string) => void) => {
    const [isListening, setIsListening] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [canUseVoice, setCanUseVoice] = useState(false);
    const [transcript, setTranscript] = useState("");

    const silenceTimer = useRef<any>(null);

    // Handle speech results
    useSpeechRecognitionEvent("result", (event) => {
        const result = event.results[0]?.transcript;
        if (result) {
            setTranscript(result);
            onTranscript(result);

            // Debounce: Reset silence timer on every new word
            if (silenceTimer.current) clearTimeout(silenceTimer.current);
            silenceTimer.current = setTimeout(() => {
                console.log("Silence detected, stopping...");
                stopListening();
            }, 2500); // 2.5s silence threshold
        }
    });

    useSpeechRecognitionEvent("error", (event) => {
        console.error("Voice Error code:", event.error, "message:", event.message);
        setIsListening(false);
        if (silenceTimer.current) clearTimeout(silenceTimer.current);
    });

    useSpeechRecognitionEvent("end", () => {
        setIsListening(false);
        if (silenceTimer.current) clearTimeout(silenceTimer.current);
    });


    useEffect(() => {
        const init = async () => {
            if (Platform.OS !== "web") {
                const result = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
                if (result.status === "granted") {
                    setCanUseVoice(true);
                } else {
                    Alert.alert("Permission Required", "Microphone permission is required for voice recognition.");
                }
            }
        };
        init();
        return () => {
            if (silenceTimer.current) clearTimeout(silenceTimer.current);
        };
    }, []);

    const stopSpeaking = useCallback(() => {
        Speech.stop();
        setIsSpeaking(false);
    }, []);

    const startListening = useCallback(async () => {
        setTranscript("");

        // Clear any old timer
        if (silenceTimer.current) clearTimeout(silenceTimer.current);

        if (!canUseVoice) {
            console.warn("Voice permission denied or not supported.");
            const result = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
            if (result.status !== "granted") return;
        }

        if (isSpeaking) stopSpeaking();

        try {
            ExpoSpeechRecognitionModule.start({
                lang: "en-US",
                interimResults: true,
                maxAlternatives: 1,
            });
            setIsListening(true);
        } catch (e: any) {
            console.error("Voice start error:", e);
            setIsListening(false);
            Alert.alert("Error", "Could not start microphone.");
        }
    }, [canUseVoice, isSpeaking, stopSpeaking]);

    const stopListening = useCallback(async () => {
        if (silenceTimer.current) clearTimeout(silenceTimer.current);
        try {
            ExpoSpeechRecognitionModule.stop();
            // Note: setIsListening(false) will be called by 'end' event usually, 
            // but for safety/speed:
            setIsListening(false);
        } catch (e) {
            console.error("Voice stop error:", e);
        }
    }, []);

    const speak = useCallback(
        (text: string, options?: { onDone?: () => void }) => {
            if (isListening) stopListening();

            Speech.speak(text, {
                language: "en-US",
                onStart: () => setIsSpeaking(true),
                onDone: () => {
                    setIsSpeaking(false);
                    if (options?.onDone) {
                        options.onDone();
                    }
                },
                onStopped: () => setIsSpeaking(false),
                onError: () => setIsSpeaking(false),
            });
        },
        [isListening, startListening, stopListening]
    );

    return {
        isListening,
        isSpeaking,
        transcript,
        canUseVoice,
        speak,
        stopSpeaking,
        startListening,
        stopListening,
    };
};
