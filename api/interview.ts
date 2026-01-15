import { API_BASE, SESSION_BASE } from "./client";
import apiClient from "./client";

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
  const { data } = await apiClient.post(`${API_BASE}/start`, payload);
  return data;
};

export const nextQuestion = async (payload: NextQuestionPayload) => {
  const { data } = await apiClient.post(`${API_BASE}/next`, payload);
  return data;
};

export const resumeInterview = async (
  payload: ResumeInterviewPayload
): Promise<InterviewSessionResponse> => {
  const { data } = await apiClient.post(`${API_BASE}/resume`, payload);
  return data;
};

export const getUserSessions = async (userId: string) => {
  const { data } = await apiClient.get(`${SESSION_BASE}/user/${userId}`);
  return data;
};

export const deleteSession = async (sessionId: string) => {
  const { data } = await apiClient.delete(`${SESSION_BASE}/${sessionId}`);
  return data;
};
