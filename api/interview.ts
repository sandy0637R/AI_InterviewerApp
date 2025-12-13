import AsyncStorage from "@react-native-async-storage/async-storage";
import axios, { InternalAxiosRequestConfig } from "axios";
import { store } from "../redux/store"; // Redux store to read token

const API_BASE = "http://192.168.0.101:5000/interview";
const SESSION_BASE = "http://192.168.0.101:5000/sessions";

// ---------------------------------------------
// Attach Bearer Token Automatically from Redux or AsyncStorage
// ---------------------------------------------
axios.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    let token = store.getState().auth.token;

    // fallback: check AsyncStorage if Redux token not yet loaded
    if (!token) {
      token = await AsyncStorage.getItem("token");
    }

    if (token) {
      if (!config.headers) {
        config.headers = new axios.AxiosHeaders();
      }
      config.headers.set("Authorization", `Bearer ${token}`);
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ---------------------------------------------
// TYPES
// ---------------------------------------------
export interface StartInterviewPayload {
  role: string;
  totalQuestions: number;
  userId?: string;
  isAnonymous?: boolean;
}

export interface NextQuestionPayload {
  sessionId: string;
  answer: string;
}

export interface ResumeInterviewPayload {
  sessionId: string;
}

// ✅ Full session structure returned by resume
export interface InterviewSessionResponse {
  success: boolean;
  session: {
    _id: string;
    role: string;
    questionsAsked: number;
    totalQuestions: number;
    answers: {
      questionNumber: number;
      question: string;
      answer: string;
    }[];
    lastQuestion?: string;
    feedback?: {
      rating: number;
      plusPoints: string[];
      improvements: string[];
      summary: string;
    } | null;
    isCompleted: boolean;
    createdAt: string;
    updatedAt: string;
  };
}

// ---------------------------------------------
// API FUNCTIONS
// ---------------------------------------------

// Start Interview
export const startInterview = async (payload: StartInterviewPayload) => {
  const { data } = await axios.post(`${API_BASE}/start`, payload);
  return data;
};

// Send Answer & Get Next Question
export const nextQuestion = async (payload: NextQuestionPayload) => {
  const { data } = await axios.post(`${API_BASE}/next`, payload);
  return data;
};

// Resume Session (FULL SESSION)
export const resumeInterview = async (
  payload: ResumeInterviewPayload
): Promise<InterviewSessionResponse> => {
  const { data } = await axios.post(`${API_BASE}/resume`, payload);
  return data;
};

// Get all sessions of a user
export const getUserSessions = async (userId: string) => {
  const { data } = await axios.get(`${SESSION_BASE}/user/${userId}`);
  return data;
};
