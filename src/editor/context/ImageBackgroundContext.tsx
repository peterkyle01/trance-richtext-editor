import { createContext, useContext, RefObject } from "react";

export const ImageBackgroundContext = createContext<RefObject<HTMLDivElement | null> | null>(
  null,
);

export function useImageBackgroundLayer() {
  return useContext(ImageBackgroundContext);
}
