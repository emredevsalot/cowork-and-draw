"use client";

import { createContext, useState, useContext, useEffect } from "react";

import { ILocalData, LocalContextType } from "@/app/types";
import { SessionProvider } from "next-auth/react";

export const LocalContext = createContext<LocalContextType | null>(null);

const defaultLocalData: ILocalData = {
  availablePixelAmount: 0,
  timerStarted: false,
  timerStartedAt: 0,
  timerMinutesRemaining: 25,
  selectedTimer: "focusTimer",
  focusDuration: 25,
  restDuration: 5,
  longRestDuration: 15,
  focusSessions: 0,
  autoStartNext: true,
  longRestInterval: 4,
};

export const Providers: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [storageValues, setStorageValues] = useState(() => {
    if (typeof window !== "undefined") {
      const localData = window.localStorage.getItem("localData");
      try {
        if (localData && localData !== undefined) {
          const parsedData = JSON.parse(localData);

          // Loop through the keys in defaultLocalData
          for (const key of Object.keys(defaultLocalData)) {
            // Check if the key from defaultLocalData is missing in parsedData
            if (!parsedData.hasOwnProperty(key)) {
              // If missing, add the key with its default value to parsedData
              parsedData[key] = (defaultLocalData as any)[key];
            }
          }

          // Update the stored data if any missing fields were added
          window.localStorage.setItem("localData", JSON.stringify(parsedData));

          return parsedData;
        } else {
          return defaultLocalData;
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
    <SessionProvider>
      <LocalContext.Provider
        value={{ storageValues, setStorageValues, storageValuesLoaded }}
      >
        {children}
      </LocalContext.Provider>
    </SessionProvider>
  );
};

export const useLocalData = () => {
  return useContext(LocalContext) as LocalContextType;
};
