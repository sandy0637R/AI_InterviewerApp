import { configureStore } from "@reduxjs/toolkit";
import createSagaMiddleware from "redux-saga";
import { all } from "redux-saga/effects";
import authSaga from "./sagas/authSaga";
import authReducer from "./slices/authSlice";
import sessionReducer from "./slices/sessionSlice";
const saga = createSagaMiddleware();

function* rootSaga() {
  yield all([authSaga()]);
}

export const store = configureStore({
  reducer: { auth: authReducer, session: sessionReducer },

  middleware: (g) => g({ thunk: false }).concat(saga),
});

saga.run(rootSaga);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
