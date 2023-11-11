import { Message } from "@/party/utils/message";

export type Canvas = {
  title: string;
  rowCount: number;
  columnCount: number;
  revealedPixels: number;
  messages: Message[];
};

export interface ILocalData {
  availablePixelAmount: number;
  timerMinutesTotal: number;
  timerStarted: boolean;
  timerStartedAt: number;
  timerMinutesRemaining: number;
}

export type LocalContextType = {
  storageValues: ILocalData;
  setStorageValues: (storageValues: ILocalData) => void;
  storageValuesLoaded: boolean;
};
