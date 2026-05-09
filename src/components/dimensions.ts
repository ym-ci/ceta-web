"use client";

import { useEffect, useState } from "react";
import type { RefObject } from "react";

type Dimensions = {
  width: number;
  height: number;
  top: number;
  right: number;
  bottom: number;
  left: number;
  x: number;
  y: number;
};

const emptyDimensions: Dimensions = {
  width: 0,
  height: 0,
  top: 0,
  right: 0,
  bottom: 0,
  left: 0,
  x: 0,
  y: 0,
};

export function useDimensions<T extends Element>(
  ref: RefObject<T | null>,
): Dimensions {
  const [dimensions, setDimensions] = useState<Dimensions>(emptyDimensions);

  useEffect(() => {
    const element = ref.current;

    if (!element) {
      return;
    }

    const measure = () => {
      const { width, height, top, right, bottom, left, x, y } =
        element.getBoundingClientRect();

      setDimensions({ width, height, top, right, bottom, left, x, y });
    };

    measure();

    if (typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", measure);

      return () => window.removeEventListener("resize", measure);
    }

    const observer = new ResizeObserver(measure);
    observer.observe(element);

    return () => observer.disconnect();
  }, [ref]);

  return dimensions;
}
