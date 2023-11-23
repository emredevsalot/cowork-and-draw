import { Message } from "@/party/utils/message";

export type CanvasType = "customCanvas" | "greenCanvas";

export type PixelInfo = { i: number; j: number; color: string };

export type Canvas = {
  title: string;
  slug: string;
  roomNumber: number;
  rowCount: number;
  columnCount: number;
  canvasType: CanvasType;
  pixelsInfo: PixelInfo[];
  revealedPixels: number;
  messages: Message[];
  isCompleted: Boolean;
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
  focusSessions: number;
  autoStartNext: boolean;
  longRestInterval: number;
}

export type LocalContextType = {
  storageValues: ILocalData;
  setStorageValues: (storageValues: ILocalData) => void;
  storageValuesLoaded: boolean;
};
