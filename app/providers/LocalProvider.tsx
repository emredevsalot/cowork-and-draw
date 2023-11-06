"use client";

import {
  createContext,
  useState,
  ReactNode,
  useContext,
  useEffect,
} from "react";

import { LocalContextType } from "../types";

export const LocalContext = createContext<LocalContextType | null>(null);

export const LocalProvider = ({ children }: { children: ReactNode }) => {
  const [storageValues, setStorageValues] = useState(() => {
    if (typeof window !== "undefined") {
      const localData = window.localStorage.getItem("localData");
      try {
        if (localData && localData !== undefined) {
          return JSON.parse(localData);
        } else {
          // default localData
          return {
            availablePixelAmount: 0,
            timerMinutesTotal: 25.015,
            timerStarted: false,
            timerStartedAt: 0,
            timerMinutesRemaining: 25.015,
          };
        }
      } catch (err: any) {
        console.log("Error: ", err.message);
      }
    }
  });

  const [storageValuesLoaded, setStorageValuesLoaded] = useState(false);

  // Save "storageValues" to localStorage every time it changes.
  useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        window.localStorage.setItem("localData", JSON.stringify(storageValues));
        setStorageValuesLoaded(true);
      }
    } catch (error) {
      console.log("Error: ", error);
    }
  }, [storageValues]);

  return (
    <LocalContext.Provider
      value={{ storageValues, setStorageValues, storageValuesLoaded }}
    >
      {children}
    </LocalContext.Provider>
  );
};

export const useLocalData = () => {
  return useContext(LocalContext) as LocalContextType;
};
