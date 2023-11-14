import { Message } from "@/party/utils/message";

export type Canvas = {
  title: string;
  rowCount: number;
  columnCount: number;
  revealedPixels: number;
  messages: Message[];
};

export type TimerId = "focusTimer" | "restTimer" | "longRestTimer";

export type TimerOption = {
  id: TimerId;
  name: string;
  duration: number;
};

export interface ILocalData {
  availablePixelAmount: number;
  timerStarted: boolean;
  timerStartedAt: number;
  timerMinutesRemaining: number;
  selectedTimer: TimerId;
  focusDuration: number;
  restDuration: number;
  longRestDuration: number;
}

export type LocalContextType = {
  storageValues: ILocalData;
  setStorageValues: (storageValues: ILocalData) => void;
  storageValuesLoaded: boolean;
};
