import AsyncStorage from "@react-native-async-storage/async-storage";
import { call, put, takeLatest, race, delay } from "redux-saga/effects";
import { loginApi, profileApi, registerApi } from "../../api/auth";
import {
  loginFailure,
  loginRequest,
  loginSuccess,
  logout,
  profileFailure,
  profileRequest,
  profileSuccess,
  registerFailure,
  registerRequest,
  registerSuccess,
  setInitialized,
  User,
} from "../slices/authSlice";

// ---------- LOAD STORED AUTH ----------
function* loadStoredAuth(): Generator<any, void, any> {
  try {
    const token: string | null = yield call([AsyncStorage, "getItem"], "token");
    const userStr: string | null = yield call([AsyncStorage, "getItem"], "user");

    if (token && userStr) {
      const user: User = JSON.parse(userStr);
      yield put(loginSuccess({ user, token }));
    }
  } catch (err) {
    console.log("Error loading stored auth:", err);
  } finally {
    // Always mark as initialized, even if no user found
    yield put(setInitialized(true));
  }
}

// ---------- LOGIN ----------
// ---------- LOGIN ----------
function* handleLogin(action: ReturnType<typeof loginRequest>): Generator<any, void, any> {
  try {
    yield call([AsyncStorage, "removeItem"], "token");
    yield call([AsyncStorage, "removeItem"], "user");

    // Race between API call and a strict timeout (e.g., 10s)
    // This safeguards against Axios or Network stack hanging indefinitely.
    const { res, timeout } = yield race({
      res: call(loginApi, action.payload),
      timeout: delay(15000),
    });

    if (timeout) {
      throw new Error("Server took too long to respond options. Check your connection.");
    }

    // Safely assert response structure
    const data = (res as { data: { user: User; token: string } }).data;

    yield call([AsyncStorage, "setItem"], "token", data.token);
    yield call([AsyncStorage, "setItem"], "user", JSON.stringify(data.user));

    yield put(loginSuccess({ user: data.user, token: data.token }));
  } catch (err: any) {
    const message =
      err?.response?.data?.message || err.message || "Invalid credentials or Server Error";
    yield put(loginFailure(message));
  }
}

// ---------- REGISTER ----------
// ---------- REGISTER ----------
function* handleRegister(action: ReturnType<typeof registerRequest>): Generator<any, void, any> {
  try {
    const { timeout } = yield race({
      res: call(registerApi, action.payload),
      timeout: delay(15000),
    });

    if (timeout) {
      throw new Error("Registration timed out - Server unreachable");
    }

    yield put(registerSuccess());
  } catch (err: any) {
    const message =
      err?.response?.data?.message || err.message || "Error registering";
    yield put(registerFailure(message));
  }
}

// ---------- PROFILE ----------
function* handleProfile(): Generator<any, void, any> {
  try {
    const { res, timeout } = yield race({
      res: call(profileApi),
      timeout: delay(5000), // Profile can be faster
    });

    if (timeout || !res) {
      // If it times out or fails silently, we just fail profile load, 
      // usually doesn't block UI as much as login/register
      throw new Error("Profile load timeout");
    }

    const data = (res as { data: { user: User } }).data;
    yield put(profileSuccess(data.user));
    yield call([AsyncStorage, "setItem"], "user", JSON.stringify(data.user));
  } catch {
    yield put(profileFailure());
  }
}

// ---------- LOGOUT ----------
function* handleLogout(): Generator<any, void, any> {
  yield call([AsyncStorage, "removeItem"], "token");
  yield call([AsyncStorage, "removeItem"], "user");
}

// ---------- ROOT SAGA ----------
export default function* authSaga(): Generator<any, void, any> {
  yield takeLatest("auth/loadStoredAuth", loadStoredAuth);
  yield takeLatest(loginRequest.type, handleLogin);
  yield takeLatest(registerRequest.type, handleRegister);
  yield takeLatest(profileRequest.type, handleProfile);
  yield takeLatest(logout.type, handleLogout);
}
