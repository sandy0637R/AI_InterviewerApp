import axios from "axios";

const API_BASE = "http://192.168.0.103:5000/interview"; // replace with your backend URL

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

// Start Interview
export const startInterview = async (payload: StartInterviewPayload) => {
  const { data } = await axios.post(`${API_BASE}/start`, payload);
  return data;
};

// Send answer & get next question
export const nextQuestion = async (payload: NextQuestionPayload) => {
  const { data } = await axios.post(`${API_BASE}/next`, payload);
  return data;
};

// Resume existing session
export const resumeInterview = async (payload: ResumeInterviewPayload) => {
  const { data } = await axios.post(`${API_BASE}/resume`, payload);
  return data;
};
