import { configureStore } from "@reduxjs/toolkit";
import cameraReducer from "./slices/cameraSlice";

export const store = configureStore({
  reducer: {
    camera: cameraReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these paths in the state for serialization checks
        ignoredActions: ["camera/startCamera", "camera/stopCamera"],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
