export type Canvas = {
  title: string;
  rowCount: number;
  columnCount: number;
  revealedPixels: number;
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
