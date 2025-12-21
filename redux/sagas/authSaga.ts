import AsyncStorage from "@react-native-async-storage/async-storage";
import { call, put, takeLatest } from "redux-saga/effects";
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
  }
}

// ---------- LOGIN ----------
function* handleLogin(action: ReturnType<typeof loginRequest>): Generator<any, void, any> {
  try {
    // Clear old data
    yield call([AsyncStorage, "removeItem"], "token");
    yield call([AsyncStorage, "removeItem"], "user");

    const res: { data: { user: User; token: string } } = yield call(loginApi, action.payload);

    // Save AsyncStorage
    yield call([AsyncStorage, "setItem"], "token", res.data.token);
    yield call([AsyncStorage, "setItem"], "user", JSON.stringify(res.data.user));

    // Update Redux first
    yield put(loginSuccess({ user: res.data.user, token: res.data.token }));
  } catch (err: any) {
    yield put(loginFailure(err?.response?.data?.message || "Invalid credentials"));
  }
}

// ---------- REGISTER ----------
function* handleRegister(action: ReturnType<typeof registerRequest>): Generator<any, void, any> {
  try {
    yield call(registerApi, action.payload);
    yield put(registerSuccess());
  } catch (err: any) {
    yield put(registerFailure(err?.response?.data?.message || "Error registering"));
  }
}

// ---------- PROFILE ----------
function* handleProfile(): Generator<any, void, any> {
  try {
    const res: { data: { user: User } } = yield call(profileApi);
    yield put(profileSuccess(res.data.user));
    yield call([AsyncStorage, "setItem"], "user", JSON.stringify(res.data.user));
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
