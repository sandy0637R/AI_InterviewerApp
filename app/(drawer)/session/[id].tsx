import { setActiveSessionId } from "@/redux/slices/sessionSlice";
import { useLocalSearchParams } from "expo-router";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import InterviewChat from "../interview_chat";

export default function SessionScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const dispatch = useDispatch();

  useEffect(() => {
    if (id) dispatch(setActiveSessionId(id));
    return () => {
      dispatch(setActiveSessionId(null));
    };
  }, [id]);

  return <InterviewChat />;
}
