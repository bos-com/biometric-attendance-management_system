import { useCallback } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { startCamera, stopCamera, toggleMinimize } from "@/store/slices/cameraSlice";

interface StartCameraOptions {
  sessionId: string;
  courseUnitCode: string;
  sessionTitle: string;
  mode?: "auto" | "manual";
}

export function useCameraControl() {
  const dispatch = useAppDispatch();
  const cameraState = useAppSelector((state) => state.camera);

  const startCameraForSession = useCallback(
    (sessionId: string, courseUnitCode: string, sessionTitle: string, mode: "auto" | "manual" = "manual") => {
      dispatch(
        startCamera({
          sessionId,
          courseUnitCode,
          sessionTitle,
          mode,
        })
      );
    },
    [dispatch]
  );

  const stopCameraSession = useCallback(() => {
    dispatch(stopCamera());
  }, [dispatch]);

  const toggleCameraMinimize = useCallback(() => {
    dispatch(toggleMinimize());
  }, [dispatch]);

  return {
    cameraState,
    startCameraForSession,
    stopCameraSession,
    toggleCameraMinimize,
  };
}
