import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { store } from "../redux/store";

const API_BASE = "http://192.168.0.102:5000/interview";
const SESSION_BASE = "http://192.168.0.102:5000/sessions";

// ----------------------------
// Axios interceptor
// ----------------------------
axios.interceptors.request.use(
  async (config) => {
    let token = store.getState().auth.token;
    if (!token) token = await AsyncStorage.getItem("token");

    if (token) {
      if (!config.headers) config.headers = new axios.AxiosHeaders(); // TS fix
      config.headers.set("Authorization", `Bearer ${token}`);
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ----------------------------
// Types
// ----------------------------
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

export interface InterviewSessionResponse {
  success: boolean;
  session: {
    _id: string;
    role: string;

    // 🔹 INTERVIEW FLOW STAGE (NEW)
    stage: "greeting" | "introduction" | "interview" | "completed";

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
    status: "in_progress" | "completed";
    createdAt: string;
    updatedAt: string;
  };
}

// ----------------------------
// API functions
// ----------------------------
export const startInterview = async (payload: StartInterviewPayload) => {
  const { data } = await axios.post(`${API_BASE}/start`, payload);
  return data;
};

export const nextQuestion = async (payload: NextQuestionPayload) => {
  const { data } = await axios.post(`${API_BASE}/next`, payload);
  return data;
};

export const resumeInterview = async (
  payload: ResumeInterviewPayload
): Promise<InterviewSessionResponse> => {
  const { data } = await axios.post(`${API_BASE}/resume`, payload);
  return data;
};

export const getUserSessions = async (userId: string) => {
  const { data } = await axios.get(`${SESSION_BASE}/user/${userId}`);
  return data;
};

export const deleteSession = async (sessionId: string) => {
  const { data } = await axios.delete(`${SESSION_BASE}/${sessionId}`);
  return data;
};
