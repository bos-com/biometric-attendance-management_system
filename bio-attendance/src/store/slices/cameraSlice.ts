import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface CameraState {
  isActive: boolean;
  sessionId: string | null;
  courseUnitCode: string | null;
  sessionTitle: string | null;
  mode: "auto" | "manual";
  startedAt: number | null;
  isMinimized: boolean;
}

const initialState: CameraState = {
  isActive: false,
  sessionId: null,
  courseUnitCode: null,
  sessionTitle: null,
  mode: "manual",
  startedAt: null,
  isMinimized: false,
};

interface StartCameraPayload {
  sessionId: string;
  courseUnitCode: string;
  sessionTitle: string;
  mode: "auto" | "manual";
}

const cameraSlice = createSlice({
  name: "camera",
  initialState,
  reducers: {
    startCamera: (state, action: PayloadAction<StartCameraPayload>) => {
      state.isActive = true;
      state.sessionId = action.payload.sessionId;
      state.courseUnitCode = action.payload.courseUnitCode;
      state.sessionTitle = action.payload.sessionTitle;
      state.mode = action.payload.mode;
      state.startedAt = Date.now();
      state.isMinimized = false;
    },
    stopCamera: (state) => {
      state.isActive = false;
      state.sessionId = null;
      state.courseUnitCode = null;
      state.sessionTitle = null;
      state.mode = "manual";
      state.startedAt = null;
      state.isMinimized = false;
    },
    minimizeCamera: (state) => {
      state.isMinimized = true;
    },
    maximizeCamera: (state) => {
      state.isMinimized = false;
    },
    toggleMinimize: (state) => {
      state.isMinimized = !state.isMinimized;
    },
  },
});

export const {
  startCamera,
  stopCamera,
  minimizeCamera,
  maximizeCamera,
  toggleMinimize,
} = cameraSlice.actions;

export default cameraSlice.reducer;
