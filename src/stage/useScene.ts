import { useEffect } from "react";
import { requestScene, type SceneRequest } from "./state";

/** Tunes the persistent screen to this route's still or loop and its register. */
export function useScene({ plate, video, lite, reg, dim = 0 }: SceneRequest) {
  useEffect(() => {
    requestScene({ plate, video, lite, reg, dim });
  }, [plate, video, lite, reg, dim]);
}
