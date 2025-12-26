import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface SessionState {
  activeSessionId: string | null;
}

const initialState: SessionState = {
  activeSessionId: null,
};

const sessionSlice = createSlice({
  name: "session",
  initialState,
  reducers: {
    setActiveSessionId: (state, action: PayloadAction<string | null>) => {
      state.activeSessionId = action.payload;
    },
  },
});

export const { setActiveSessionId } = sessionSlice.actions;
export default sessionSlice.reducer;
