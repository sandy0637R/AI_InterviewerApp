import { AxiosResponse } from "axios";
import { call, put, takeLatest } from "redux-saga/effects";
import { loginApi, profileApi, registerApi } from "../../api/auth";
import {
  loginFailure,
  loginRequest,
  loginSuccess,
  profileFailure,
  profileRequest,
  profileSuccess,
  registerFailure,
  registerRequest,
  registerSuccess,
  User,
} from "../slices/authSlice";

// ------------------------------
// LOGIN
// ------------------------------
function* handleLogin(
  action: ReturnType<typeof loginRequest>
): Generator<any, void, AxiosResponse<{ user: User; token: string }>> {
  try {
    const res = (yield call(loginApi, action.payload)) as AxiosResponse<{ user: User; token: string }>;
    yield put(loginSuccess(res.data));
  } catch (err: any) {
    yield put(loginFailure(err?.response?.data?.message || "Invalid credentials"));
  }
}

// ------------------------------
// REGISTER
// ------------------------------
function* handleRegister(
  action: ReturnType<typeof registerRequest>
): Generator<any, void, AxiosResponse<any>> {
  try {
    yield call(registerApi, action.payload); // call API
    yield put(registerSuccess()); // no payload
  } catch (err: any) {
    yield put(registerFailure(err?.response?.data?.message || "Error registering"));
  }
}


// ------------------------------
// PROFILE
// ------------------------------
function* handleProfile(
  action: ReturnType<typeof profileRequest>
): Generator<any, void, AxiosResponse<{ user: User }>> {
  try {
    const res = (yield call(profileApi, action.payload)) as AxiosResponse<{ user: User }>;
    yield put(profileSuccess(res.data.user));
  } catch (err: any) {
    yield put(profileFailure());
  }
}

// ------------------------------
// ROOT SAGA
// ------------------------------
export default function* authSaga(): Generator {
  yield takeLatest(loginRequest.type, handleLogin);
  yield takeLatest(registerRequest.type, handleRegister);
  yield takeLatest(profileRequest.type, handleProfile);
}
