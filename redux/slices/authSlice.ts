import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// ------------------------------
// TYPES
// ------------------------------
interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthState {
  loading: boolean;
  user: User | null;
  token: string | null;
  error: string | null;
}

// ------------------------------
// INITIAL STATE
// ------------------------------
const initialState: AuthState = {
  loading: false,
  user: null,
  token: null,
  error: null,
};

// ------------------------------
// SLICE
// ------------------------------
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    // LOGIN
    loginRequest: (state, _action: PayloadAction<{ email: string; password: string }>) => {
      state.loading = true;
    },
    loginSuccess: (state, action: PayloadAction<{ user: User; token: string }>) => {
      state.loading = false;
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.error = null;
    },
    loginFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    // REGISTER
    registerRequest: (state, _action: PayloadAction<{ name: string; email: string; password: string }>) => {
      state.loading = true;
    },
    registerSuccess: (state) => {
      state.loading = false;
      state.error = null;
    },
    registerFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    // PROFILE
    profileRequest: (state, _action: PayloadAction<string>) => {
      state.loading = true;
    },
    profileSuccess: (state, action: PayloadAction<User>) => {
      state.loading = false;
      state.user = action.payload;
      state.error = null;
    },
    profileFailure: (state) => {
      state.loading = false;
    },

    // LOGOUT
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.error = null;
    },
  },
});

export const {
  loginRequest,
  loginSuccess,
  loginFailure,
  registerRequest,
  registerSuccess,
  registerFailure,
  profileRequest,
  profileSuccess,
  profileFailure,
  logout,
} = authSlice.actions;

export type { User };

export default authSlice.reducer;
